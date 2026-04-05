// Core rag-adjustment algorithm — framework-agnostic, direct DOM mutation
import { RAG_CLASSES, type RagOptions } from './types'

/** Resolved defaults applied when options are omitted */
const DEFAULTS: Required<RagOptions> = {
	ragDifference: 80,
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
 * Applies rag adjustment to a container element.
 *
 * The algorithm runs five passes:
 *  1. Reset — restore the container to the original HTML snapshot
 *  2. Widow removal — replace the last space in each block with &nbsp;
 *  3. Word wrap — wrap every word in a measurement span
 *  4. Line grouping — walk word spans, accumulate widths, break into line spans
 *  5. Tracking — distribute per-line slack as letter-spacing, capped at maxTracking
 *
 * @param container   - The live DOM element to adjust (must be rendered and visible)
 * @param originalHTML - The HTML snapshot taken before the first adjustment run
 * @param options      - Rag options (merged with defaults)
 */
export function applyRag(
	container: HTMLElement,
	originalHTML: string,
	options: RagOptions = {},
): void {
	const { ragDifference, maxTracking } = { ...DEFAULTS, ...options }

	// --- Pass 1: Reset ---
	container.innerHTML = originalHTML

	// --- Pass 2: Widow removal ---
	// Replace the last whitespace in each block so the final word never wraps alone.
	container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach((block) => {
		block.innerHTML = block.innerHTML.replace(/\s(?=[^\s]*$)/g, '\u00a0')
	})

	// --- Pass 3: Word wrap ---
	// Collect block elements; fall back to the container if none are found.
	const blocks = Array.from(
		container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR),
	) as HTMLElement[]
	const targets: HTMLElement[] = blocks.length > 0 ? blocks : [container]

	targets.forEach((el) => {
		el.innerHTML = el.innerHTML.replace(
			WORD_WRAP_RE,
			`<span class="${RAG_CLASSES.word}">$1$2</span>`,
		)
	})

	// --- Pass 4: Line grouping ---
	// Batch all offsetWidth reads before any writes to avoid layout thrashing.
	// For each target: read all word widths first, then rebuild innerHTML once.
	targets.forEach((element) => {
		const elementWidth = element.offsetWidth
		const words = Array.from(element.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.word}`))

		// Read phase — collect all widths in one pass
		const wordData = words.map((word) => ({
			outerHTML: word.outerHTML,
			width: word.offsetWidth,
		}))

		// Write phase — build new HTML string
		let html = `<span class="${RAG_CLASSES.line}">`
		let lineWidth = 0
		let lineCount = 1

		wordData.forEach(({ outerHTML, width }) => {
			const idealWidth = elementWidth - 1 - (lineCount % 2 === 0 ? ragDifference : 0)

			if (width + lineWidth < idealWidth) {
				html += outerHTML
			} else {
				html += `<span class="${RAG_CLASSES.lineInfo}" style="display:none" data-ideal-width="${idealWidth}" data-line-width="${lineWidth}"></span></span>`
				html += `<span class="${RAG_CLASSES.line}">`
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

		const charCount = line.textContent?.length ?? 1
		const difference = idealWidth - lineWidth
		const tracking = Math.min(difference / charCount, maxTracking)
		line.style.letterSpacing = `${tracking}px`
	})
}

/**
 * Strips all rag-rub injected markup, restoring the container to its original HTML.
 *
 * @param container    - The element that was previously adjusted
 * @param originalHTML - The snapshot passed to the original applyRag call
 */
export function removeRag(container: HTMLElement, originalHTML: string): void {
	container.innerHTML = originalHTML
}
