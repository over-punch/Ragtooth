// React hook that attaches rag adjustment to a DOM ref with ResizeObserver support
import { useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import { applyRag, removeRag } from '../core/adjust'
import type { RagOptions } from '../core/types'

/**
 * Applies rag adjustment to an element ref.
 *
 * Usage:
 * ```tsx
 * const { ref } = useRag({ ragDifference: 80, maxTracking: 0.7 })
 * <p ref={ref}>Long paragraph of text...</p>
 * ```
 *
 * The hook:
 * - Runs the adjustment after every render (useLayoutEffect) to stay in sync
 * - Re-runs whenever the container resizes (ResizeObserver, debounced via rAF)
 * - Cleans up injected markup on unmount
 * - Is SSR-safe: all DOM access is gated behind environment checks
 */
export function useRag(options: RagOptions = {}): { ref: React.RefObject<HTMLElement> } {
	const ref = useRef<HTMLElement>(null)

	// Store original HTML snapshot — taken once on first run, before any mutation
	const originalHTMLRef = useRef<string | null>(null)

	// Keep a stable ref to the latest options so the ResizeObserver callback
	// always uses current values without needing to re-register the observer
	const optionsRef = useRef<RagOptions>(options)
	optionsRef.current = options

	/** Run the full adjustment pipeline. Safe to call repeatedly. */
	const run = useCallback(() => {
		const el = ref.current
		if (!el || typeof window === 'undefined') return

		// Snapshot original HTML exactly once, before the first mutation
		if (originalHTMLRef.current === null) {
			originalHTMLRef.current = el.innerHTML
		}

		applyRag(el, originalHTMLRef.current, optionsRef.current)
	}, []) // stable — options read via ref

	// Re-run synchronously after every render so layout is correct before paint.
	// Depend on the option values so a change in options triggers a re-run.
	useLayoutEffect(() => {
		run()
	}, [run, options.ragDifference, options.maxTracking])

	// Attach ResizeObserver — re-run when the container's width changes.
	// Debounce via requestAnimationFrame to avoid redundant recalculations
	// during fast resize events.
	useEffect(() => {
		const el = ref.current
		if (!el || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return

		let rafId: number

		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(run)
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
	}, [run])

	return { ref }
}
