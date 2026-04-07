// React hook that attaches rag adjustment to a DOM ref with ResizeObserver support
import { useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import { applyRag, removeRag, getCleanHTML } from '../core/adjust'
import type { RagOptions } from '../core/types'

/**
 * Applies rag adjustment to an element ref.
 *
 * Usage:
 * ```tsx
 * const { ref } = useRag({ sawDepth: 80, maxTracking: 0.7 })
 * <p ref={ref}>Long paragraph of text...</p>
 * ```
 *
 * The hook:
 * - Runs the adjustment after every render (useLayoutEffect) to stay in sync
 * - Re-runs whenever the container's width changes (ResizeObserver, debounced via rAF)
 * - Skips re-runs when only height changes
 * - Auto-re-snapshots when contentKey changes (no need for key prop on content updates)
 * - Cleans up injected markup on unmount
 * - Is SSR-safe: all DOM access is gated behind environment checks
 *
 * @param options    - Rag options
 * @param contentKey - Optional string that, when changed, triggers a fresh HTML snapshot.
 *                     Pass the text content of children to avoid needing a key prop.
 */
export function useRag(
	options: RagOptions = {},
	contentKey?: string,
): { ref: React.RefObject<HTMLElement | null> } {
	const ref = useRef<HTMLElement>(null)

	// Store original HTML snapshot — taken once on first run, before any mutation.
	// Reset to null when contentKey changes to force a fresh snapshot.
	const originalHTMLRef = useRef<string | null>(null)

	// Keep a stable ref to the latest options so the ResizeObserver callback
	// always uses current values without needing to re-register the observer.
	const optionsRef = useRef<RagOptions>(options)
	optionsRef.current = options

	// Track last observed container width to skip ResizeObserver callbacks
	// that are triggered by height-only changes.
	const lastWidthRef = useRef<number>(-1)

	// Track previous contentKey to detect changes during render (synchronous,
	// before any effects fire), so the snapshot is always reset before run().
	const prevContentKeyRef = useRef<string | undefined>(contentKey)
	if (contentKey !== undefined && prevContentKeyRef.current !== contentKey) {
		prevContentKeyRef.current = contentKey
		originalHTMLRef.current = null
	}

	/** Run the full adjustment pipeline. Safe to call repeatedly. */
	const run = useCallback(() => {
		const el = ref.current
		if (!el || typeof window === 'undefined') return

		// Snapshot the clean HTML exactly once per content lifecycle.
		// getCleanHTML strips any partial rag markup left by React reconciliation.
		if (originalHTMLRef.current === null) {
			originalHTMLRef.current = getCleanHTML(el)
		}

		// Preserve scroll position across the DOM mutation.
		// applyRag rewrites innerHTML twice (reset + line-group), changing element height.
		// On iOS Safari, overflow-anchor:none does not apply to viewport scroll, so the
		// browser adjusts scrollY when content above the fold changes height. We counter
		// this with two layers of restoration:
		//  1. Synchronous scrollTo immediately after mutations — wins on most browsers.
		//  2. rAF fallback — catches browsers where layout-time adjustment overrides (1).
		const scrollY = window.scrollY

		applyRag(el, originalHTMLRef.current, optionsRef.current)

		// Layer 1: synchronous restore (fires before next paint on most engines)
		if (window.scrollY !== scrollY) {
			window.scrollTo(0, scrollY)
		}

		// Layer 2: rAF restore in case the browser overrides layer 1 during layout
		const rafId = requestAnimationFrame(() => {
			if (window.scrollY !== scrollY) {
				window.scrollTo(0, scrollY)
			}
		})

		// Cancel the rAF if run() is called again before it fires (e.g. rapid updates)
		return rafId
	}, []) // stable — options and snapshot read via refs

	// Re-run synchronously after every relevant render so layout is correct before paint.
	useLayoutEffect(() => {
		const rafId = run()
		return () => { if (rafId !== undefined) cancelAnimationFrame(rafId) }
	}, [run, options.sawDepth, options.sawPeriod, options.maxTracking, options.ragDifference, options.sawAlign, options.sawPhase, contentKey])

	// Re-run once all fonts are loaded — word widths measured before fonts arrive
	// (common on mobile first-visit) will be wrong, so we need a corrective pass.
	useEffect(() => {
		if (typeof document === 'undefined' || !document.fonts) return
		let rafId: number | undefined
		document.fonts.ready.then(() => { rafId = run() })
		return () => { if (rafId !== undefined) cancelAnimationFrame(rafId) }
	}, [run])

	// Attach ResizeObserver — re-run only when the container's width changes.
	// Debounce via requestAnimationFrame to avoid redundant recalculations
	// during fast resize events.
	// When resize is false, skip the observer entirely (static contexts).
	const resize = options.resize ?? true
	useEffect(() => {
		const el = ref.current
		if (!el || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return

		// Cleanup-only path when resize is disabled: still removes markup on unmount.
		if (!resize) {
			return () => {
				if (el && originalHTMLRef.current !== null) {
					removeRag(el, originalHTMLRef.current)
				}
			}
		}

		let rafId: number

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = Math.round(entry.contentRect.width)
				if (width === lastWidthRef.current) return
				lastWidthRef.current = width
				cancelAnimationFrame(rafId)
				rafId = requestAnimationFrame(run)
			}
		})

		observer.observe(el)

		return () => {
			cancelAnimationFrame(rafId)
			observer.disconnect()
			// Restore original markup on unmount
			if (el && originalHTMLRef.current !== null) {
				removeRag(el, originalHTMLRef.current)
			}
		}
	}, [run, resize])

	return { ref }
}
