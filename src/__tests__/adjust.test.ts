import { describe, it, expect, beforeEach } from 'vitest'
import { applyRag, removeRag } from '../core/adjust'
import { RAG_CLASSES } from '../core/types'

// Helper: create a container div with known HTML
function makeContainer(html: string): HTMLElement {
	const el = document.createElement('div')
	el.innerHTML = html
	document.body.appendChild(el)
	return el
}

// Helper: mock offsetWidth on an element and all descendants
function mockOffsetWidth(el: HTMLElement, value: number) {
	Object.defineProperty(el, 'offsetWidth', { get: () => value, configurable: true })
	el.querySelectorAll<HTMLElement>('*').forEach((child) => {
		Object.defineProperty(child, 'offsetWidth', { get: () => value, configurable: true })
	})
}

beforeEach(() => {
	document.body.innerHTML = ''
})

// --- removeRag ---

describe('removeRag', () => {
	it('restores the container to the original HTML', () => {
		const original = '<p>Hello world</p>'
		const el = makeContainer('<p>Mutated content <span>injected</span></p>')
		removeRag(el, original)
		expect(el.innerHTML).toBe(original)
	})
})

// --- Widow removal ---

describe('widow removal', () => {
	it('replaces the last space in a paragraph with a non-breaking space', () => {
		const el = makeContainer('<p>One two three four</p>')
		mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		// The last space before "four" should be \u00a0
		const text = el.querySelector('p')?.innerHTML ?? ''
		expect(text).toContain('\u00a0')
	})

	it('does not affect text with no spaces', () => {
		const el = makeContainer('<p>Oneword</p>')
		mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		expect(el.innerHTML).not.toContain('\u00a0')
	})
})

// --- Word wrap spans ---

describe('word wrapping', () => {
	it('wraps words in rag-word spans', () => {
		const el = makeContainer('<p>Hello world foo</p>')
		mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const wordSpans = el.querySelectorAll(`.${RAG_CLASSES.word}`)
		// Each word should get a span (widow removal replaces last space so "foo" is still a word)
		expect(wordSpans.length).toBeGreaterThan(0)
	})
})

// --- Line grouping ---

describe('line grouping', () => {
	it('creates rag-line spans', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		// Container is wide, words are also wide — forces line breaks
		Object.defineProperty(el, 'offsetWidth', { get: () => 200, configurable: true })
		const original = el.innerHTML
		applyRag(el, original, { ragDifference: 50 })
		// After adjustment, rag-line spans should exist
		const lines = el.querySelectorAll(`.${RAG_CLASSES.line}`)
		expect(lines.length).toBeGreaterThan(0)
	})

	it('creates rag-line-info sentinels with data attributes', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta</p>')
		Object.defineProperty(el, 'offsetWidth', { get: () => 200, configurable: true })
		const original = el.innerHTML
		applyRag(el, original, { ragDifference: 50 })
		const infos = el.querySelectorAll(`.${RAG_CLASSES.lineInfo}`)
		infos.forEach((info) => {
			expect(info.getAttribute('data-ideal-width')).not.toBeNull()
			expect(info.getAttribute('data-line-width')).not.toBeNull()
		})
	})
})

// --- Tracking calculation ---

describe('tracking calculation', () => {
	it('applies letter-spacing to line spans', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta</p>')
		Object.defineProperty(el, 'offsetWidth', { get: () => 300, configurable: true })
		const original = el.innerHTML
		applyRag(el, original, { ragDifference: 80, maxTracking: 0.7 })
		const lines = el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.line}`)
		const hasTracking = Array.from(lines).some(
			(line) => line.style.letterSpacing !== '',
		)
		expect(hasTracking).toBe(true)
	})

	it('never exceeds maxTracking', () => {
		const el = makeContainer('<p>Alpha beta gamma delta epsilon zeta eta theta iota</p>')
		Object.defineProperty(el, 'offsetWidth', { get: () => 500, configurable: true })
		const original = el.innerHTML
		const maxTracking = 0.5
		applyRag(el, original, { ragDifference: 400, maxTracking })
		const lines = el.querySelectorAll<HTMLElement>(`.${RAG_CLASSES.line}`)
		lines.forEach((line) => {
			if (!line.style.letterSpacing) return
			const value = parseFloat(line.style.letterSpacing)
			expect(value).toBeLessThanOrEqual(maxTracking)
		})
	})
})

// --- Idempotency ---

describe('idempotency', () => {
	it('produces the same result when run twice with the same original snapshot', () => {
		const el = makeContainer('<p>Hello world foo bar baz</p>')
		mockOffsetWidth(el, 100)
		const original = el.innerHTML
		applyRag(el, original)
		const firstRun = el.innerHTML
		applyRag(el, original)
		const secondRun = el.innerHTML
		expect(secondRun).toBe(firstRun)
	})
})

// --- SSR safety ---

describe('SSR safety', () => {
	it('returns early without throwing when window is undefined', () => {
		// Simulate SSR by temporarily hiding window
		const win = globalThis.window
		// @ts-expect-error intentional SSR simulation
		delete globalThis.window
		const el = makeContainer('<p>Hello world</p>')
		const original = el.innerHTML
		expect(() => applyRag(el, original)).not.toThrow()
		globalThis.window = win
	})
})
