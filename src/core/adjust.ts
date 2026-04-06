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
 * Regex that wraps every word token in a span.
 * Group 1: preceding tag or whitespace (preserved).
 * Group 2: the word itself.
 */
const WORD_WRAP_RE = /(^|<\/?[^>]+>|\s+)([^\s<]+)/g

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

	// Resolve options — support deprecated ragDifference as fallback for sawDepth
	const sawDepth = resolveValue(options.sawDepth ?? options.ragDifference ?? DEFAULTS.sawDepth, containerWidth, fontSize)
	const sawPeriod = options.sawPeriod ?? DEFAULTS.sawPeriod
	const maxTracking = resolveValue(options.maxTracking ?? DEFAULTS.maxTracking, containerWidth, fontSize)

	// --- Pass 1: Reset ---
	container.innerHTML = originalHTML

	// --- Pass 2: Widow removal ---
	container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach((block) => {
		block.innerHTML = block.innerHTML.replace(/\s(?=[^\s]*$)/g, '\u00a0')
	})

	// --- Pass 3: Word wrap ---
	const blocks = Array.from(container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
	const targets: HTMLElement[] = blocks.length > 0 ? blocks : [container]

	targets.forEach((el) => {
		el.innerHTML = el.innerHTML.replace(
			WORD_WRAP_RE,
			`<span class="${RAG_CLASSES.word}">$1$2</span>`,
		)
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

		// Read phase — collect all widths in one pass
		const wordData = words.map((word) => ({
			outerHTML: word.outerHTML,
			width: word.offsetWidth,
		}))

		// Write phase — build new HTML string
		let html = `<span class="${RAG_CLASSES.line}" style="${LINE_STYLE}">`
		let lineWidth = 0
		let lineCount = 1

		wordData.forEach(({ outerHTML, width }) => {
			// Every sawPeriod-th line is shortened by sawDepth pixels
			const offset = lineCount % sawPeriod === 0 ? sawDepth : 0
			const idealWidth = Math.max(1, elementWidth - 1 - offset)

			if (width + lineWidth < idealWidth) {
				html += outerHTML
			} else {
				// Close line, insert forced break, open next line
				html += `<span class="${RAG_CLASSES.lineInfo}" style="display:none" data-ideal-width="${idealWidth}" data-line-width="${lineWidth}"></span></span>`
				html += `<br class="${RAG_CLASSES.break}">`
				html += `<span class="${RAG_CLASSES.line}" style="${LINE_STYLE}">`
				html += outerHTML
				lineWidth = 0
				lineCount++
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
