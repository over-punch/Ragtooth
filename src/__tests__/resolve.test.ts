// Tests for resolveValue — RagValue unit conversion to pixels
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveValue } from '../core/resolve'

const W = 600  // container width used throughout
const FS = 20  // element font-size (px)

describe('resolveValue — plain numbers', () => {
	it('returns the number unchanged', () => {
		expect(resolveValue(80, W, FS)).toBe(80)
	})

	it('returns 0 when given 0', () => {
		expect(resolveValue(0, W, FS)).toBe(0)
	})

	it('returns negative numbers unchanged', () => {
		expect(resolveValue(-10, W, FS)).toBe(-10)
	})

	it('handles decimal numbers', () => {
		expect(resolveValue(0.7, W, FS)).toBe(0.7)
	})
})

describe('resolveValue — px strings', () => {
	it('parses "80px"', () => {
		expect(resolveValue('80px', W, FS)).toBe(80)
	})

	it('parses "0px"', () => {
		expect(resolveValue('0px', W, FS)).toBe(0)
	})

	it('parses "1.5px"', () => {
		expect(resolveValue('1.5px', W, FS)).toBeCloseTo(1.5)
	})

	it('handles whitespace around the value', () => {
		expect(resolveValue('  80px  ', W, FS)).toBe(80)
	})
})

describe('resolveValue — % strings', () => {
	it('resolves "20%" of 600px container to 120px', () => {
		expect(resolveValue('20%', 600, FS)).toBeCloseTo(120)
	})

	it('resolves "50%" of 400px container to 200px', () => {
		expect(resolveValue('50%', 400, FS)).toBeCloseTo(200)
	})

	it('resolves "100%" to the full container width', () => {
		expect(resolveValue('100%', 600, FS)).toBeCloseTo(600)
	})

	it('resolves "0%" to 0', () => {
		expect(resolveValue('0%', 600, FS)).toBeCloseTo(0)
	})

	it('resolves "10.5%"', () => {
		expect(resolveValue('10.5%', 1000, FS)).toBeCloseTo(105)
	})
})

describe('resolveValue — em strings', () => {
	it('resolves "1em" to the element font-size', () => {
		expect(resolveValue('1em', W, 20)).toBeCloseTo(20)
	})

	it('resolves "2em" to twice the element font-size', () => {
		expect(resolveValue('2em', W, 16)).toBeCloseTo(32)
	})

	it('resolves "0.5em"', () => {
		expect(resolveValue('0.5em', W, 16)).toBeCloseTo(8)
	})

	it('is independent of container width', () => {
		expect(resolveValue('2em', 300, 20)).toBeCloseTo(40)
		expect(resolveValue('2em', 900, 20)).toBeCloseTo(40)
	})
})

describe('resolveValue — rem strings', () => {
	beforeEach(() => {
		document.documentElement.style.fontSize = '16px'
	})

	afterEach(() => {
		document.documentElement.style.fontSize = ''
	})

	it('resolves "1rem" to the root font-size', () => {
		document.documentElement.style.fontSize = '16px'
		expect(resolveValue('1rem', W, FS)).toBeCloseTo(16)
	})

	it('resolves "2rem"', () => {
		document.documentElement.style.fontSize = '20px'
		expect(resolveValue('2rem', W, FS)).toBeCloseTo(40)
	})

	it('resolves "0.5rem"', () => {
		document.documentElement.style.fontSize = '16px'
		expect(resolveValue('0.5rem', W, FS)).toBeCloseTo(8)
	})

	it('falls back to 16px if root font-size is unset', () => {
		document.documentElement.style.fontSize = ''
		// getComputedStyle returns '' → parseFloat('') = NaN → fallback 16
		// result: 1 * 16 = 16
		expect(resolveValue('1rem', W, FS)).toBeCloseTo(16)
	})

	it('is independent of element font-size', () => {
		document.documentElement.style.fontSize = '16px'
		expect(resolveValue('1rem', W, 12)).toBeCloseTo(16)
		expect(resolveValue('1rem', W, 24)).toBeCloseTo(16)
	})
})

describe('resolveValue — bare numeric strings', () => {
	it('parses "80" as 80px', () => {
		expect(resolveValue('80', W, FS)).toBe(80)
	})

	it('parses "0" as 0', () => {
		expect(resolveValue('0', W, FS)).toBe(0)
	})
})

describe('resolveValue — unit equivalence', () => {
	it('"20%" of 500px equals the plain number 100', () => {
		expect(resolveValue('20%', 500, FS)).toBeCloseTo(resolveValue(100, 500, FS))
	})

	it('"2em" at 16px font-size equals plain number 32', () => {
		expect(resolveValue('2em', W, 16)).toBeCloseTo(resolveValue(32, W, 16))
	})

	it('"80px" equals plain number 80', () => {
		expect(resolveValue('80px', W, FS)).toBeCloseTo(resolveValue(80, W, FS))
	})
})
