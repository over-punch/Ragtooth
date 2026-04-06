// Converts a RagValue (number or unit string) to pixels
import type { RagValue } from './types'

/**
 * Resolves a RagValue to a pixel number.
 *
 * @param value          - Raw value: plain number (px), or string with unit suffix
 * @param containerWidth - Width of the rag container in px (used for %)
 * @param fontSize       - Computed font-size of the element in px (used for em)
 */
export function resolveValue(value: RagValue, containerWidth: number, fontSize: number): number {
	if (typeof value === 'number') return value
	const s = value.trim()
	if (s.endsWith('%')) return containerWidth * parseFloat(s) / 100
	if (s.endsWith('rem')) {
		const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
		return rootSize * parseFloat(s)
	}
	if (s.endsWith('em')) return fontSize * parseFloat(s)
	return parseFloat(s) // px or bare number string
}
