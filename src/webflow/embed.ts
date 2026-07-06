// ragtooth/src/webflow/embed.ts — zero-config browser bundle for Webflow Custom Code Embed.
// Auto-applies the saw-rag to any element marked with [data-ragtooth], reading options from
// data-* attributes, and re-runs on viewport resize. Exposes a small window.Ragtooth API.
import { applyRag, removeRag } from '../core/adjust'
import type { RagOptions, RagValue } from '../core/types'

/** Attribute that opts an element in to the saw-rag. */
const OPT_IN_ATTR = 'data-ragtooth'

/** Valid sawtooth alignment anchors for data-rt-saw-align. */
const VALID_ALIGNS: readonly string[] = ['top', 'bottom']

/** Per-element teardown record so destroy() can restore markup and refit() can re-run. */
interface Instance {
	/** Clean HTML snapshot taken before the first apply, for re-runs and restoration. */
	originalHTML: string
	/** Whether this element should be re-fitted on viewport resize. */
	resize: boolean
}

/** Tracks live instances keyed by their element — WeakMap so removed nodes are GC'd. */
const INSTANCES = new WeakMap<HTMLElement, Instance>()

/** Live element set iterated on resize — the WeakMap alone is not enumerable. */
const tracked = new Set<HTMLElement>()

/**
 * Coerce a raw data-* string into a RagValue (number or unit string).
 * A bare numeric string (e.g. "80") becomes a number (pixels); anything with a
 * unit suffix (e.g. "20%", "2em", "1rem", "5ch", "1px") is passed through as a
 * string for the core resolver to interpret.
 *
 * @param raw - Raw attribute value
 */
function toRagValue(raw: string): RagValue {
	const s = raw.trim()
	return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : s
}

/**
 * Read ragtooth options from an element's data-* attributes.
 * Unset attributes fall through to the library defaults.
 *
 * Supported attributes:
 *   data-rt-saw-depth    — how far short lines pull in (number px, or "20%", "2em", "1rem", "5ch")
 *   data-rt-saw-period   — lines per saw cycle (integer, min 2)
 *   data-rt-max-tracking — max letter-spacing per line (number px, or "0.05em", "1px")
 *   data-rt-saw-phase    — 1-indexed line within each cycle that is shortened
 *   data-rt-saw-align    — 'top' (default) or 'bottom'
 *   data-rt-resize       — "false" to opt out of resize re-fitting
 *
 * @param el - The opted-in element
 */
function readOptions(el: HTMLElement): RagOptions {
	const d = el.dataset
	const opts: RagOptions = {}

	if (d.rtSawDepth !== undefined && d.rtSawDepth !== '') {
		opts.sawDepth = toRagValue(d.rtSawDepth)
	}
	if (d.rtSawPeriod !== undefined) {
		const n = parseInt(d.rtSawPeriod, 10)
		if (!isNaN(n)) opts.sawPeriod = n
	}
	if (d.rtMaxTracking !== undefined && d.rtMaxTracking !== '') {
		opts.maxTracking = toRagValue(d.rtMaxTracking)
	}
	if (d.rtSawPhase !== undefined) {
		const n = parseInt(d.rtSawPhase, 10)
		if (!isNaN(n)) opts.sawPhase = n
	}
	if (d.rtSawAlign && VALID_ALIGNS.includes(d.rtSawAlign)) {
		opts.sawAlign = d.rtSawAlign as RagOptions['sawAlign']
	}

	return opts
}

/**
 * Apply the saw-rag to a single element and register it for resize re-fitting.
 * Idempotent — re-initialising an element restores its saved original first,
 * so repeated calls never double-wrap.
 *
 * @param el - Element to rag
 */
function initElement(el: HTMLElement): void {
	// Reuse an existing snapshot if this element was already initialised, so a
	// re-init reads from clean markup rather than already-ragged spans.
	const prev = INSTANCES.get(el)
	const originalHTML = prev ? prev.originalHTML : el.innerHTML
	const resize = el.dataset.rtResize !== 'false'

	applyRag(el, originalHTML, readOptions(el))
	INSTANCES.set(el, { originalHTML, resize })
	tracked.add(el)
}

/**
 * Re-apply the saw-rag to every tracked element that opts in to resize handling.
 * applyRag resets to the saved original first, so repeated calls are idempotent.
 */
function refit(): void {
	tracked.forEach((el) => {
		const inst = INSTANCES.get(el)
		if (!inst || !inst.resize) return
		applyRag(el, inst.originalHTML, readOptions(el))
	})
}

/**
 * Restore and stop tracking a single element if it has a live instance.
 *
 * @param el - Element previously initialised
 */
function destroy(el: HTMLElement): void {
	const inst = INSTANCES.get(el)
	if (!inst) return
	removeRag(el, inst.originalHTML)
	INSTANCES.delete(el)
	tracked.delete(el)
}

/**
 * Scan a root for opted-in elements and rag each one.
 *
 * @param root - Element or document to search (default: document)
 */
function init(root: ParentNode = document): void {
	root.querySelectorAll<HTMLElement>(`[${OPT_IN_ATTR}]`).forEach(initElement)
}

// Re-fit on viewport resize — the container's width drives the line breaks. Throttled to
// one re-fit per animation frame so a drag-resize doesn't run the search on every event.
let resizeRaf = 0
function onResize(): void {
	if (resizeRaf) cancelAnimationFrame(resizeRaf)
	resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; refit() })
}

/**
 * Auto-initialise once the DOM is parsed and web fonts have loaded.
 * Fonts must settle first: line breaks and per-line tracking both depend on final
 * glyph metrics, which shift when a web font swaps in.
 */
function autoInit(): void {
	const run = () => {
		if (document.fonts?.ready) {
			document.fonts.ready.then(() => init()).catch(() => init())
		} else {
			init()
		}
		window.addEventListener('resize', onResize)
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run, { once: true })
	} else {
		run()
	}
}

autoInit()

// Public browser API — assigned to window.Ragtooth via the IIFE global name.
export { init, refit, destroy }
