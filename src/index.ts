// Public API for rag-rub

// React bindings
export { useRag } from './react/useRag'
export { RagText } from './react/RagText'
export type { RagTextProps } from './react/RagText'

// Core (framework-agnostic)
export { applyRag, removeRag } from './core/adjust'

// Types
export type { RagOptions } from './core/types'
export { RAG_CLASSES } from './core/types'
