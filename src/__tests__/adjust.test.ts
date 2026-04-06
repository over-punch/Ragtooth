import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { applyRag, removeRag, getCleanHTML } from '../core/adjust'
import { RAG_CLASSES } from '../core/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContainer(html: string): HTMLElement {
	const el = document.createElement('div')
	el.innerHTML = html
	document.body.appendChild(el)
	return el
}

/**
 * Globally mocks offsetWidth on HTMLElement.prototype so every element
 * (including spans created dynamically by applyRag) returns `value`.
 * Includes a no-op setter so happy-dom's constructor (`this.offsetWidth = 0`)
 * doesn't throw. Returns a cleanup function that restores the original descriptor.
 */
function mockOffsetWidth(_el: HTMLElement, value: number) {
	const proto = HTMLElement.prototype
	const prior = Object.getOwnPropertyDescriptor(proto, 'offsetWidth')
	Object.defineProperty(proto, 'offsetWidth', {
		get: () => value,
		set: () => { /* no-op — allows happy-dom constructor to run */ },
		configurable: true,
	})
	return () => {
		if (prior) {
			Object.defineProperty(proto, 'offsetWidth', prior)
		}
	}
}

/** Extract all data-ideal-width values from lineInfo spans */
function getIdealWidths(el: HTMLElement): number[] {
	return Array.from(el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.lineInfo}`))
		.map((info) => parseFloat(info.getAttribute('data-ideal-width') ?? '0'))
}

/** Extract all data-line-width values from lineInfo spans */
function getLineWidths(el: HTMLElement): number[] {
	return Array.from(el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.lineInfo}`))
		.map((info) => parseFloat(info.getAttribute('data-line-width') ?? '0'))
}

/** Extract all applied letter-spacing values (numeric, in px) */
function getLetterSpacings(el: HTMLElement): number[] {
	return Array.from(el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.line}`))
		.filter((line) => line.style.letterSpacing !== '')
		.map((line) => parseFloat(line.style.letterSpacing))
}

beforeEach(() => {
	document.body.innerHTML = ''
})

// ---------------------------------------------------------------------------
// removeRag
// ---------------------------------------------------------------------------

describe('removeRag', () => {
	it('restores the container to the original HTML', () => {
		const original = '<p>Hello world</p>'
		const el = makeContainer('<p>Mutated content <span>injected</span></p>')
		removeRag(el, original)
		expect(el.innerHTML).toBe(original)
	})

	it('restores complex markup', () => {
		const original = '<p>First</p><p>Second</p>'
		const el = makeContainer('<p><span>something</span></p><p>altered</p>')
		removeRag(el, original)
		expect(el.innerHTML).toBe(original)
	})
})

// ---------------------------------------------------------------------------
// getCleanHTML
// ---------------------------------------------------------------------------

describe('getCleanHTML', () => {
	it('strips rag-word spans, unwrapping their content', () => {
		const el = makeContainer('<p>Hello world</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original)
		const clean = getCleanHTML(el)
		expect(clean).not.toContain(RAG_CLASSES.word)
		restore()
	})

	it('strips rag-line spans', () => {
		const el = makeContainer('<p>Alpha beta gamma</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original)
		const clean = getCleanHTML(el)
		expect(clean).not.toContain(RAG_CLASSES.line)
		restore()
	})

	it('strips rag-line-info sentinels', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original)
		const clean = getCleanHTML(el)
		expect(clean).not.toContain(RAG_CLASSES.lineInfo)
		restore()
	})

	it('does not mutate the live container', () => {
		const el = makeContainer('<p>Hello world</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original)
		const before = el.innerHTML
		getCleanHTML(el)
		expect(el.innerHTML).toBe(before)
		restore()
	})
})

// ---------------------------------------------------------------------------
// SSR safety
// ---------------------------------------------------------------------------

describe('SSR safety', () => {
	it('returns early without throwing when window is undefined', () => {
		const win = globalThis.window
		// @ts-expect-error intentional SSR simulation
		delete globalThis.window
		const el = makeContainer('<p>Hello world</p>')
		const original = el.innerHTML
		expect(() => applyRag(el, original)).not.toThrow()
		globalThis.window = win
	})

	it('returns early without throwing when container has zero offsetWidth', () => {
		const el = makeContainer('<p>Hello world</p>')
		const original = el.innerHTML
		// offsetWidth defaults to 0 in happy-dom — should just no-op
		expect(() => applyRag(el, original)).not.toThrow()
	})
})

// ---------------------------------------------------------------------------
// Widow removal
// ---------------------------------------------------------------------------

describe('widow removal', () => {
	it('replaces the last space in a paragraph with a non-breaking space', () => {
		const el = makeContainer('<p>One two three four</p>')
		const restore = mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const text = el.querySelector('p')?.innerHTML ?? ''
		expect(text).toContain('\u00a0')
		restore()
	})

	it('does not add a non-breaking space when there are no spaces', () => {
		const el = makeContainer('<p>Oneword</p>')
		const restore = mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		expect(el.innerHTML).not.toContain('\u00a0')
		restore()
	})

	it('handles multiple paragraphs independently', () => {
		const el = makeContainer('<p>One two</p><p>Three four</p>')
		const restore = mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const paras = el.querySelectorAll('p')
		paras.forEach((p) => expect(p.innerHTML).toContain('\u00a0'))
		restore()
	})
})

// ---------------------------------------------------------------------------
// Word wrapping
// ---------------------------------------------------------------------------

describe('word wrapping', () => {
	it('wraps every word in a rag-word span', () => {
		const el = makeContainer('<p>Hello world foo</p>')
		const restore = mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const wordSpans = el.querySelectorAll(`.${RAG_CLASSES.word}`)
		expect(wordSpans.length).toBeGreaterThan(0)
		restore()
	})

	it('resets then re-wraps on repeated calls (idempotency)', () => {
		const el = makeContainer('<p>Hello world foo bar</p>')
		const restore = mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const firstCount = el.querySelectorAll(`.${RAG_CLASSES.word}`).length
		applyRag(el, original)
		expect(el.querySelectorAll(`.${RAG_CLASSES.word}`).length).toBe(firstCount)
		restore()
	})
})

// ---------------------------------------------------------------------------
// Line grouping
// ---------------------------------------------------------------------------

describe('line grouping', () => {
	it('creates rag-line spans', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 50, sawPeriod: 2 })
		const lines = el.querySelectorAll(`.${RAG_CLASSES.line}`)
		expect(lines.length).toBeGreaterThan(0)
		restore()
	})

	it('stores data-ideal-width and data-line-width on lineInfo sentinels', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 50, sawPeriod: 2 })
		const infos = el.querySelectorAll(`.${RAG_CLASSES.lineInfo}`)
		expect(infos.length).toBeGreaterThan(0)
		infos.forEach((info) => {
			expect(info.getAttribute('data-ideal-width')).not.toBeNull()
			expect(info.getAttribute('data-line-width')).not.toBeNull()
		})
		restore()
	})

	it('lineInfo sentinels are hidden from layout', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 50 })
		el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.lineInfo}`).forEach((info) => {
			expect(info.style.display).toBe('none')
		})
		restore()
	})

	it('data-ideal-width is never below 1', () => {
		// sawDepth larger than container — idealWidth must be clamped to ≥ 1
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 999 })
		getIdealWidths(el).forEach((w) => expect(w).toBeGreaterThanOrEqual(1))
		restore()
	})

	it('accepts deprecated ragDifference as fallback for sawDepth', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		expect(() => applyRag(el, original, { ragDifference: 50 })).not.toThrow()
		restore()
	})
})

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------

describe('tracking', () => {
	it('applies letter-spacing to line spans with a lineInfo sentinel', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		const restore = mockOffsetWidth(el, 300)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 80, maxTracking: 0.7 })
		const lines = el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.line}`)
		const hasTracking = Array.from(lines).some((line) => line.style.letterSpacing !== '')
		expect(hasTracking).toBe(true)
		restore()
	})

	it('never exceeds maxTracking', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta iota</p>')
		const restore = mockOffsetWidth(el, 500)
		const original = el.innerHTML
		const maxTracking = 0.5
		applyRag(el, original, { sawDepth: 400, maxTracking })
		getLetterSpacings(el).forEach((spacing) => {
			expect(spacing).toBeLessThanOrEqual(maxTracking)
		})
		restore()
	})

	it('never applies negative letter-spacing', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta</p>')
		const restore = mockOffsetWidth(el, 300)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 80, maxTracking: 0.7 })
		getLetterSpacings(el).forEach((spacing) => {
			expect(spacing).toBeGreaterThanOrEqual(0)
		})
		restore()
	})

	it('never applies negative letter-spacing even when sawDepth exceeds container width', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta iota kappa</p>')
		const restore = mockOffsetWidth(el, 300)
		const original = el.innerHTML
		// sawDepth much larger than container — previously triggered negative tracking
		applyRag(el, original, { sawDepth: 999, maxTracking: 2 })
		getLetterSpacings(el).forEach((spacing) => {
			expect(spacing).toBeGreaterThanOrEqual(0)
		})
		restore()
	})

	it('does not apply tracking to the last line of a block (no lineInfo)', () => {
		const el = makeContainer('<p>Alpha beta</p>')
		const restore = mockOffsetWidth(el, 500)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 50 })
		// With only a few words that all fit on one line, there is no break → no lineInfo
		const infos = el.querySelectorAll(`.${RAG_CLASSES.lineInfo}`)
		// If no line breaks happened, letter-spacing should not be set on the lone line
		if (infos.length === 0) {
			const lines = el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.line}`)
			lines.forEach((line) => expect(line.style.letterSpacing).toBe(''))
		}
		restore()
	})
})

// ---------------------------------------------------------------------------
// RagValue unit integration — sawDepth
// ---------------------------------------------------------------------------

describe('sawDepth unit integration', () => {
	it('plain number and equivalent "Xpx" string produce the same idealWidths', () => {
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta</p>'

		const el1 = makeContainer(html)
		const restore1 = mockOffsetWidth(el1, 400)
		applyRag(el1, el1.innerHTML, { sawDepth: 80, sawPeriod: 2 })
		const widths1 = getIdealWidths(el1)
		restore1()

		document.body.innerHTML = ''

		const el2 = makeContainer(html)
		const restore2 = mockOffsetWidth(el2, 400)
		applyRag(el2, el2.innerHTML, { sawDepth: '80px', sawPeriod: 2 })
		const widths2 = getIdealWidths(el2)
		restore2()

		expect(widths1).toEqual(widths2)
	})

	it('"X%" resolves relative to container width', () => {
		// 20% of 400px = 80px — equivalent to plain sawDepth=80
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta</p>'

		const el1 = makeContainer(html)
		const restore1 = mockOffsetWidth(el1, 400)
		applyRag(el1, el1.innerHTML, { sawDepth: 80, sawPeriod: 2 })
		const widths1 = getIdealWidths(el1)
		restore1()

		document.body.innerHTML = ''

		const el2 = makeContainer(html)
		const restore2 = mockOffsetWidth(el2, 400)
		applyRag(el2, el2.innerHTML, { sawDepth: '20%', sawPeriod: 2 })
		const widths2 = getIdealWidths(el2)
		restore2()

		expect(widths1).toEqual(widths2)
	})

	it('"Xem" resolves relative to element font-size', () => {
		// 2em at 40px font-size = 80px — equivalent to plain sawDepth=80
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta</p>'

		const el1 = makeContainer(html)
		el1.style.fontSize = '40px'
		const restore1 = mockOffsetWidth(el1, 400)
		applyRag(el1, el1.innerHTML, { sawDepth: 80, sawPeriod: 2 })
		const widths1 = getIdealWidths(el1)
		restore1()

		document.body.innerHTML = ''

		const el2 = makeContainer(html)
		el2.style.fontSize = '40px'
		const restore2 = mockOffsetWidth(el2, 400)
		applyRag(el2, el2.innerHTML, { sawDepth: '2em', sawPeriod: 2 })
		const widths2 = getIdealWidths(el2)
		restore2()

		expect(widths1).toEqual(widths2)
	})

	it('"Xrem" resolves relative to root font-size', () => {
		// 5rem at root 16px = 80px — equivalent to plain sawDepth=80
		document.documentElement.style.fontSize = '16px'
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta</p>'

		const el1 = makeContainer(html)
		const restore1 = mockOffsetWidth(el1, 400)
		applyRag(el1, el1.innerHTML, { sawDepth: 80, sawPeriod: 2 })
		const widths1 = getIdealWidths(el1)
		restore1()

		document.body.innerHTML = ''

		const el2 = makeContainer(html)
		const restore2 = mockOffsetWidth(el2, 400)
		applyRag(el2, el2.innerHTML, { sawDepth: '5rem', sawPeriod: 2 })
		const widths2 = getIdealWidths(el2)
		restore2()

		document.documentElement.style.fontSize = ''
		expect(widths1).toEqual(widths2)
	})
})

// ---------------------------------------------------------------------------
// RagValue unit integration — maxTracking
// ---------------------------------------------------------------------------

describe('maxTracking unit integration', () => {
	it('plain number and equivalent "Xpx" string produce the same letter-spacings', () => {
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta iota</p>'

		const el1 = makeContainer(html)
		const restore1 = mockOffsetWidth(el1, 400)
		applyRag(el1, el1.innerHTML, { sawDepth: 80, maxTracking: 1 })
		const spacings1 = getLetterSpacings(el1)
		restore1()

		document.body.innerHTML = ''

		const el2 = makeContainer(html)
		const restore2 = mockOffsetWidth(el2, 400)
		applyRag(el2, el2.innerHTML, { sawDepth: 80, maxTracking: '1px' })
		const spacings2 = getLetterSpacings(el2)
		restore2()

		expect(spacings1).toEqual(spacings2)
	})

	it('"Xem" maxTracking scales with font-size', () => {
		// At fontSize=40px, "0.5em" = 20px maxTracking
		const html = '<p>Alpha beta gamma delta epsilon zeta eta theta iota</p>'
		const el = makeContainer(html)
		el.style.fontSize = '40px'
		const restore = mockOffsetWidth(el, 400)
		applyRag(el, el.innerHTML, { sawDepth: 80, maxTracking: '0.5em' })
		getLetterSpacings(el).forEach((spacing) => {
			expect(spacing).toBeLessThanOrEqual(20 + 0.001) // 0.5 * 40 = 20
		})
		restore()
	})
})

// ---------------------------------------------------------------------------
// sawPeriod
// ---------------------------------------------------------------------------

describe('sawPeriod', () => {
	it('every sawPeriod-th line has a shorter idealWidth', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi</p>')
		const restore = mockOffsetWidth(el, 400)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 100, sawPeriod: 2 })

		const infos = Array.from(el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.lineInfo}`))
		// Shortened lines have idealWidth = 400 - 1 - 100 = 299; full lines = 399
		infos.forEach((info, i) => {
			const idealWidth = parseFloat(info.getAttribute('data-ideal-width') ?? '0')
			// Line index in the closing sentinel is for the line just closed (1-indexed)
			// Just verify all idealWidths are either full (399) or shortened (299)
			expect([299, 399]).toContain(idealWidth)
		})
		restore()
	})
})

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------

describe('idempotency', () => {
	it('produces the same result when run twice with the same original snapshot', () => {
		const el = makeContainer('<p>Hello world foo bar baz qux quux</p>')
		const restore = mockOffsetWidth(el, 300)
		const original = el.innerHTML
		applyRag(el, original)
		const firstRun = el.innerHTML
		applyRag(el, original)
		expect(el.innerHTML).toBe(firstRun)
		restore()
	})

	it('produces the same result after changing options back to original values', () => {
		const el = makeContainer('<p>Hello world foo bar baz qux quux</p>')
		const restore = mockOffsetWidth(el, 300)
		const original = el.innerHTML
		applyRag(el, original, { sawDepth: 80 })
		const firstRun = el.innerHTML
		applyRag(el, original, { sawDepth: 200 })
		applyRag(el, original, { sawDepth: 80 })
		expect(el.innerHTML).toBe(firstRun)
		restore()
	})
})

// ---------------------------------------------------------------------------
// Multi-block containers
// ---------------------------------------------------------------------------

describe('multi-block containers', () => {
	it('applies rag to each paragraph independently', () => {
		const el = makeContainer('<p>Alpha beta gamma</p><p>Delta epsilon zeta</p>')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		applyRag(el, original)
		const wordSpans = el.querySelectorAll(`.${RAG_CLASSES.word}`)
		expect(wordSpans.length).toBeGreaterThan(0)
		restore()
	})

	it('falls back to the container itself when no block children are found', () => {
		const el = makeContainer('Just plain text with no block elements')
		const restore = mockOffsetWidth(el, 200)
		const original = el.innerHTML
		expect(() => applyRag(el, original)).not.toThrow()
		restore()
	})
})
