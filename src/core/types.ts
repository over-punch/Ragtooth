// Shared types for rag-rub core and React layers

/** Options controlling how the rag is shaped */
export interface RagOptions {
	/**
	 * How many pixels shorter even-numbered lines are vs. odd lines.
	 * Higher values create a more pronounced alternating zigzag rag.
	 * @default 80
	 */
	ragDifference?: number

	/**
	 * Maximum letter-spacing in pixels that any line can receive.
	 * Prevents very short lines from being stretched grotesquely.
	 * @default 0.7
	 */
	maxTracking?: number
}

/** CSS class names injected by the algorithm — exported so consumers can target/reset them */
export const RAG_CLASSES = {
	word: 'rag-word',
	line: 'rag-line',
	lineInfo: 'rag-line-info',
} as const
