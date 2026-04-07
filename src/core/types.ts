// Shared types for ragtooth core and React layers

/**
 * A numeric value with an optional unit suffix.
 * - Plain number → pixels (e.g. `80`)
 * - `"20%"` → percentage of the container's width
 * - `"80px"` → pixels (explicit)
 * - `"1.5em"` → relative to the element's computed font-size
 * - `"1rem"` → relative to the root font-size
 * - `"5ch"` → 5× the width of the "0" glyph in the element's current font
 */
export type RagValue = number | string

/** Options controlling how the saw rag is shaped */
export interface RagOptions {
	/**
	 * How far short lines are pulled in from full width.
	 * Higher values create a more pronounced sawtooth.
	 * Accepts a RagValue: plain number (px), `"20%"`, `"80px"`, `"2em"`, `"1rem"`.
	 * @default 80
	 */
	sawDepth?: RagValue

	/**
	 * How many lines per saw cycle.
	 * `2` = classic alternating saw (full, short, full, short).
	 * `3` = two full lines then one short.
	 * `4` = three full lines then one short.
	 * @default 2
	 */
	sawPeriod?: number

	/**
	 * Maximum letter-spacing any line can receive.
	 * Accepts a RagValue: plain number (px), `"0.05em"`, `"1px"`, etc.
	 * Prevents very short lines from being stretched grotesquely.
	 * @default 0.7
	 */
	maxTracking?: RagValue

	/**
	 * Which line within each period cycle is shortened (1-indexed).
	 * `1` = first line of each cycle is short, `sawPeriod` = last line (default).
	 * Values outside `[1, sawPeriod]` are clamped automatically.
	 *
	 * Example: `sawPeriod: 3, sawPhase: 2` → every group of three lines has
	 * the *second* line shortened, leaving the third full.
	 * @default sawPeriod (last line of each cycle)
	 */
	sawPhase?: number

	/**
	 * Whether the sawtooth cycle is anchored to the top or bottom of the block.
	 * - `'top'` (default): short lines count from the first line downward.
	 * - `'bottom'`: short lines count from the last line upward, so the paragraph
	 *   ending stays full-width. Use with `sawPeriod: 3` to guarantee the last two
	 *   lines are always full, eliminating the awkward short-penultimate-line effect.
	 * @default 'top'
	 */
	sawAlign?: 'top' | 'bottom'

	/**
	 * Whether to re-run the adjustment when the container's width changes.
	 * When `true` (default), a ResizeObserver watches the element and re-runs the
	 * algorithm on any width change — covering window resize, orientation change, and
	 * any other layout shift that affects the container.
	 * Set to `false` to opt out of automatic resize tracking (useful for static
	 * contexts where the container width never changes).
	 * @default true
	 */
	resize?: boolean

	/**
	 * @deprecated Use `sawDepth` instead.
	 */
	ragDifference?: number
}

/** CSS class names injected by the algorithm — exported so consumers can target/reset them */
export const RAG_CLASSES = {
	word: 'rag-word',
	line: 'rag-line',
	lineInfo: 'rag-line-info',
	break: 'rag-break',
	/** Internal class for the space-width measurement probe — not injected into page markup */
	spaceProbe: 'rag-space-probe',
} as const
