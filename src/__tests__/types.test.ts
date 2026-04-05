import { describe, it, expect } from 'vitest'
import { RAG_CLASSES } from '../core/types'

describe('RAG_CLASSES', () => {
	it('has the expected class names', () => {
		expect(RAG_CLASSES.word).toBe('rag-word')
		expect(RAG_CLASSES.line).toBe('rag-line')
		expect(RAG_CLASSES.lineInfo).toBe('rag-line-info')
	})
})
