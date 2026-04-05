// Shared types for ragtooth core and React layers

/** Options controlling how the saw rag is shaped */
export interface RagOptions {
	/**
	 * How many pixels shorter the short lines are vs. full-width lines.
	 * Higher values create a more pronounced sawtooth.
	 * @default 80
	 */
	sawDepth?: number

	/**
	 * How many lines per saw cycle.
	 * `2` = classic alternating saw (full, short, full, short).
	 * `3` = two full lines then one short.
	 * `4` = three full lines then one short.
	 * @default 2
	 */
	sawPeriod?: number

	/**
	 * Maximum letter-spacing in pixels that any line can receive.
	 * Prevents very short lines from being stretched grotesquely.
	 * @default 0.7
	 */
	maxTracking?: number

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
