// Converts a RagValue (number or unit string) to pixels
import type { RagValue } from './types'

/**
 * Resolves a RagValue to a pixel number.
 *
 * @param value          - Raw value: plain number (px), or string with unit suffix
 * @param containerWidth - Width of the rag container in px (used for %)
 * @param fontSize       - Computed font-size of the element in px (used for em)
 * @param chWidth        - Width of the '0' glyph in px (used for ch); defaults to 0
 */
export function resolveValue(value: RagValue, containerWidth: number, fontSize: number, chWidth = 0): number {
	if (typeof value === 'number') return isNaN(value) ? 0 : value
	const s = value.trim()
	let result: number
	if (s.endsWith('%')) {
		result = containerWidth * parseFloat(s) / 100
	} else if (s.endsWith('rem')) {
		const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
		result = rootSize * parseFloat(s)
	} else if (s.endsWith('em')) {
		result = fontSize * parseFloat(s)
	} else if (s.endsWith('ch')) {
		result = chWidth * parseFloat(s)
	} else {
		result = parseFloat(s) // px or bare number string
	}
	return isNaN(result) ? 0 : result
}
