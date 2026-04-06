// Shared types for ragtooth core and React layers

/**
 * A numeric value with an optional unit suffix.
 * - Plain number → pixels (e.g. `80`)
 * - `"20%"` → percentage of the container's width
 * - `"80px"` → pixels (explicit)
 * - `"1.5em"` → relative to the element's computed font-size
 * - `"1rem"` → relative to the root font-size
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
	 * @deprecated Use `sawDepth` instead.
	 */
	ragDifference?: number
}

/** CSS class names injected by the algorithm — exported so consumers can target/reset them */
export const RAG_CLASSES = {
	word: 'rag-word',
	line: 'rag-line',
	lineInfo: 'rag-line-info',
} as const
