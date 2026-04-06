// Core saw-rag algorithm — framework-agnostic, direct DOM mutation
import { RAG_CLASSES, type RagOptions } from './types'
import { resolveValue } from './resolve'

/** Resolved defaults applied when options are omitted */
const DEFAULTS = {
	sawDepth: 80,
	sawPeriod: 2,
	maxTracking: 0.7,
}

/**
 * Block-level element selectors the algorithm targets within the container.
 * Falls back to the container itself if none are found.
 */
const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote'


/**
 * Returns the innerHTML of a container with all ragtooth-injected spans removed,
 * unwrapping their children in place. Uses DOM traversal — safe for complex markup.
 *
 * @param container - Element that may contain rag markup
 */
export function getCleanHTML(container: HTMLElement): string {
	const clone = container.cloneNode(true) as HTMLElement
	const ragSpans = clone.querySelectorAll(
		`.${RAG_CLASSES.word}, .${RAG_CLASSES.line}, .${RAG_CLASSES.lineInfo}, .${RAG_CLASSES.break}`,
	)
	ragSpans.forEach((el) => {
		const parent = el.parentNode
		if (!parent) return
		while (el.firstChild) parent.insertBefore(el.firstChild, el)
		parent.removeChild(el)
	})
	return clone.innerHTML
}

/**
 * Applies saw-rag adjustment to a container element.
 *
 * The algorithm runs five passes:
 *  1. Reset — restore the container to the original HTML snapshot
 *  2. Widow removal — replace the last space in each block with &nbsp;
 *  3. Word wrap — wrap every word in a measurement span
 *  4. Line grouping — walk word spans, accumulate widths, break into line spans;
 *     every sawPeriod-th line is shortened by sawDepth pixels
 *  5. Tracking — distribute per-line slack as letter-spacing, capped at maxTracking
 *
 * @param container    - The live DOM element to adjust (must be rendered and visible)
 * @param originalHTML - The HTML snapshot taken before the first adjustment run
 * @param options      - Rag options (merged with defaults)
 */
export function applyRag(
	container: HTMLElement,
	originalHTML: string,
	options: RagOptions = {},
): void {
	if (typeof window === 'undefined') return
	if (container.offsetWidth === 0) return

	const containerWidth = container.offsetWidth
	const fontSize = parseFloat(getComputedStyle(container).fontSize) || 16

	// Measure the 'ch' unit — width of the '0' glyph in the container's current font.
	// The probe inherits font styles by being a child of the container.
	const chProbe = document.createElement('span')
	chProbe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;'
	chProbe.textContent = '0'
	container.appendChild(chProbe)
	const chWidth = chProbe.offsetWidth
	container.removeChild(chProbe)

	// Resolve options — support deprecated ragDifference as fallback for sawDepth
	const sawDepth = Math.max(0, resolveValue(options.sawDepth ?? options.ragDifference ?? DEFAULTS.sawDepth, containerWidth, fontSize, chWidth))
	const sawPeriod = Math.max(2, Math.round(options.sawPeriod ?? DEFAULTS.sawPeriod))
	const maxTracking = Math.max(0, resolveValue(options.maxTracking ?? DEFAULTS.maxTracking, containerWidth, fontSize, chWidth))
	const sawAlign = options.sawAlign ?? 'top'
	// sawPhase: 1-indexed position within the cycle that is shortened.
	// Default = sawPeriod (last line), matching the pre-sawPhase behaviour.
	const sawPhase = Math.min(sawPeriod, Math.max(1, Math.round(options.sawPhase ?? sawPeriod)))

	// --- Pass 1: Reset ---
	container.innerHTML = originalHTML

	// --- Pass 2: Widow removal ---
	container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach((block) => {
		block.innerHTML = block.innerHTML.replace(/\s(?=[^\s]*$)/g, '\u00a0')
	})

	// --- Pass 3: Word wrap ---
	// Uses DOM traversal rather than regex so inline elements (<em>, <strong>, etc.)
	// are preserved correctly — each word span is inserted into the correct parent
	// element, keeping italic and bold contexts intact.
	const blocks = Array.from(container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
	const targets: HTMLElement[] = blocks.length > 0 ? blocks : [container]

	targets.forEach((el) => {
		// Collect all text nodes first to avoid live-NodeList issues during mutation.
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
		const textNodes: Text[] = []
		while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

		for (const textNode of textNodes) {
			const text = textNode.textContent ?? ''
			if (!text) continue

			// Split into alternating [whitespace, word, whitespace, word, …] tokens.
			// Odd-indexed entries are words; even-indexed are the gaps before them.
			const tokens = text.split(/(\S+)/)
			const fragment = document.createDocumentFragment()

			for (let i = 0; i < tokens.length; i += 2) {
				const space = tokens[i]       // whitespace gap before this word
				const word  = tokens[i + 1]   // word (undefined at end of string)
				if (!word) continue // trailing whitespace — absorbed into the preceding span below

				// If this is the last word in the text node, include any trailing whitespace
				// in the span rather than creating an orphan text node. Orphan text nodes at
				// inline-element boundaries (e.g. "of " before <strong>1455</strong>) are
				// silently dropped in Pass 4, which removes the space between words.
				const isLastWord = tokens[i + 3] === undefined
				const trailingSpace = isLastWord ? (tokens[i + 2] ?? '') : ''

				const span = document.createElement('span')
				span.className = RAG_CLASSES.word
				span.appendChild(document.createTextNode(space + word + trailingSpace))
				fragment.appendChild(span)
			}

			textNode.parentNode!.replaceChild(fragment, textNode)
		}
	})

	// --- Pass 4: Line grouping ---
	// Each line becomes an inline-block span with white-space:nowrap so the browser
	// treats it as one unit. A <br> between spans forces the visual line break that
	// the algorithm predicts — without this, the browser reflows text freely across
	// span boundaries and the sawtooth never appears.
	const LINE_STYLE = 'display:inline-block;white-space:nowrap;vertical-align:top;'

	// Batch all offsetWidth reads before any writes to avoid layout thrashing.
	targets.forEach((element) => {
		const elementWidth = element.offsetWidth
		const words = Array.from(element.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.word}`))

		// Read phase — collect all widths in one pass.
		// Also build contextual HTML for each word: the word span wrapped in its
		// ancestor inline elements (em, strong, a, etc.) up to the block element.
		// This preserves italic, bold, and other inline styling when the HTML is
		// reassembled in the write phase. Each word is self-contained so a line
		// break between two words inside the same <em> simply produces two adjacent
		// <em> elements — semantically split but visually identical.
		const wordData = words.map((word) => {
			let html = word.outerHTML
			let ancestor: Element | null = word.parentElement
			while (ancestor && ancestor !== element) {
				// Use a shallow clone to get a properly-serialised open/close tag pair
				// (handles attribute values with special characters correctly).
				const shallow = ancestor.cloneNode(false) as Element
				const shallowHTML = shallow.outerHTML
				const split = shallowHTML.lastIndexOf('</')
				html = shallowHTML.slice(0, split) + html + shallowHTML.slice(split)
				ancestor = ancestor.parentElement
			}
			return { html, width: word.offsetWidth }
		})

		// For bottom-aligned mode, pre-count lines so we know how far each line sits from
		// the end of the block. A top-aligned first pass gives an estimate; a second pass
		// applies the actual bottom-aligned cycle using that estimate. This resolves the
		// parity mismatch that occurs when the first estimate is even — without the second
		// pass the short-line positions flip completely, producing wrong line breaks and
		// cascading single-word lines at the end.
		let totalLines = 1
		if (sawAlign === 'bottom') {
			// Pass A: top-aligned estimate
			let preWidth = 0
			let preCount = 1
			wordData.forEach(({ width }) => {
				const preOffset = preCount % sawPeriod === sawPhase % sawPeriod ? sawDepth : 0
				const preIdeal = Math.max(1, elementWidth - 1 - preOffset)
				if (width + preWidth >= preIdeal) {
					preCount++
					preWidth = 0
				}
				preWidth += width
			})
			// Pass B: bottom-aligned re-count using the estimate from Pass A
			const estimated = preCount
			preWidth = 0
			preCount = 1
			wordData.forEach(({ width }) => {
				const cyclePos = Math.max(1, estimated - preCount + 1)
				const preOffset = cyclePos % sawPeriod === sawPhase % sawPeriod ? sawDepth : 0
				const preIdeal = Math.max(1, elementWidth - 1 - preOffset)
				if (width + preWidth >= preIdeal) {
					preCount++
					preWidth = 0
				}
				preWidth += width
			})
			totalLines = preCount
		}

		// Strip leading whitespace from the rag-word span content — needed for the
		// first word of each line because display:inline-block collapses leading spaces.
		const trimLineStart = (whtml: string) =>
			whtml.replace(/(class="rag-word">)\s+/, '$1')

		// Write phase — build new HTML string
		let html = `<span class="${RAG_CLASSES.line}" style="${LINE_STYLE}">`
		let lineWidth = 0
		let lineCount = 1
		let lineStart = true // true for the first word of each new line

		wordData.forEach(({ html: wordHTML, width }) => {
			// Determine whether this line is shortened.
			// sawPhase (1-indexed) controls which position within the period is short.
			// top: count from the first line. bottom: count from the last line upward.
			// Clamp posFromBottom to ≥ 1 to keep the last line full if pre-count underestimates.
			const cyclePos = sawAlign === 'bottom'
				? Math.max(1, totalLines - lineCount + 1)
				: lineCount
			const isShortLine = cyclePos % sawPeriod === sawPhase % sawPeriod
			const offset = isShortLine ? sawDepth : 0
			const idealWidth = Math.max(1, elementWidth - 1 - offset)

			if (width + lineWidth < idealWidth) {
				html += lineStart ? trimLineStart(wordHTML) : wordHTML
				lineStart = false
			} else {
				// Close line, insert forced break, open next line
				html += `<span class="${RAG_CLASSES.lineInfo}" style="display:none" data-ideal-width="${idealWidth}" data-line-width="${lineWidth}"></span></span>`
				html += `<br class="${RAG_CLASSES.break}">`
				html += `<span class="${RAG_CLASSES.line}" style="${LINE_STYLE}">`
				html += trimLineStart(wordHTML)
				lineWidth = 0
				lineCount++
				lineStart = false
			}
			lineWidth += width
		})

		html += '</span>'
		element.innerHTML = html
	})

	// --- Pass 5: Tracking ---
	container.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.lineInfo}`).forEach((info) => {
		const idealWidth = parseFloat(info.getAttribute('data-ideal-width') ?? '0') - 1
		const lineWidth = parseFloat(info.getAttribute('data-line-width') ?? '0')
		const line = info.parentElement
		if (!line) return

		const charCount = line.textContent?.length || 1
		const difference = idealWidth - lineWidth
		const tracking = Math.max(0, Math.min(difference / charCount, maxTracking))
		line.style.letterSpacing = `${tracking}px`
	})
}

/**
 * Strips all ragtooth injected markup, restoring the container to its original HTML.
 *
 * @param container    - The element that was previously adjusted
 * @param originalHTML - The snapshot passed to the original applyRag call
 */
export function removeRag(container: HTMLElement, originalHTML: string): void {
	container.innerHTML = originalHTML
}
