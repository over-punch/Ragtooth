// React hook and component tests for useRag and RagText via @testing-library/react
import React from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useRag } from '../react/useRag'
import { RagText } from '../react/RagText'
import { RAG_CLASSES } from '../core/types'

// ---------------------------------------------------------------------------
// Mock helpers — copied from adjust.test.ts to keep happy-dom measurements stable
// ---------------------------------------------------------------------------

/**
 * Mocks offsetWidth and getBoundingClientRect on all elements so they return
 * `value`. Probe spans (rag-space-probe) return 0 to avoid skewing line math.
 * Returns a cleanup function that restores both originals.
 */
function mockOffsetWidth(value: number) {
	const proto = HTMLElement.prototype
	const prior = Object.getOwnPropertyDescriptor(proto, 'offsetWidth')
	Object.defineProperty(proto, 'offsetWidth', {
		get: function (this: HTMLElement) {
			if (this.classList?.contains(RAG_CLASSES.spaceProbe)) return 0
			return value
		},
		set: () => { /* no-op — allows happy-dom constructor to run */ },
		configurable: true,
	})
	const origBCR = Element.prototype.getBoundingClientRect
	Element.prototype.getBoundingClientRect = function (this: Element) {
		if ((this as HTMLElement).classList?.contains(RAG_CLASSES.spaceProbe)) {
			return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
		}
		return { width: value, height: 0, top: 0, left: 0, right: value, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
	}
	return () => {
		if (prior) Object.defineProperty(proto, 'offsetWidth', prior)
		Element.prototype.getBoundingClientRect = origBCR
	}
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
	document.body.innerHTML = ''
})

// ---------------------------------------------------------------------------
// useRag
// ---------------------------------------------------------------------------

describe('useRag', () => {
	it('mounts and unmounts without throwing', () => {
		const restore = mockOffsetWidth(300)
		let hook: ReturnType<typeof renderHook<{ ref: React.RefObject<HTMLElement | null> }, object>>
		expect(() => {
			hook = renderHook(() => useRag())
		}).not.toThrow()
		expect(() => {
			hook!.unmount()
		}).not.toThrow()
		restore()
	})

	it('returns a ref object', () => {
		const restore = mockOffsetWidth(300)
		const { result } = renderHook(() => useRag())
		expect(result.current).toHaveProperty('ref')
		expect(result.current.ref).toBeDefined()
		restore()
	})

	it('accepts default options without throwing', () => {
		const restore = mockOffsetWidth(300)
		expect(() => renderHook(() => useRag({}))).not.toThrow()
		restore()
	})

	it('accepts all documented options without throwing', () => {
		const restore = mockOffsetWidth(300)
		expect(() =>
			renderHook(() =>
				useRag({
					sawDepth: 80,
					sawPeriod: 2,
					sawPhase: 2,
					maxTracking: 0.7,
					ragDifference: undefined,
					sawAlign: 'top',
					resize: true,
				}),
			),
		).not.toThrow()
		restore()
	})

	it('re-runs when options change without throwing', () => {
		const restore = mockOffsetWidth(300)
		const { rerender } = renderHook(
			({ depth }: { depth: number }) => useRag({ sawDepth: depth }),
			{ initialProps: { depth: 80 } },
		)
		expect(() => {
			act(() => {
				rerender({ depth: 120 })
			})
		}).not.toThrow()
		restore()
	})

	it('accepts resize: false without throwing', () => {
		const restore = mockOffsetWidth(300)
		expect(() => renderHook(() => useRag({ resize: false }))).not.toThrow()
		restore()
	})

	it('accepts a contentKey argument without throwing', () => {
		const restore = mockOffsetWidth(300)
		const { rerender } = renderHook(
			({ key }: { key: string }) => useRag({}, key),
			{ initialProps: { key: 'initial text' } },
		)
		expect(() => {
			act(() => {
				rerender({ key: 'updated text' })
			})
		}).not.toThrow()
		restore()
	})
})

// ---------------------------------------------------------------------------
// RagText
// ---------------------------------------------------------------------------

describe('RagText', () => {
	it('renders children', () => {
		const restore = mockOffsetWidth(300)
		const { container } = render(<RagText>Hello world</RagText>)
		// applyRag wraps words into spans, so check textContent rather than a single text node
		expect(container.textContent).toContain('Hello')
		expect(container.textContent).toContain('world')
		restore()
	})

	it('renders a <p> element by default', () => {
		const restore = mockOffsetWidth(300)
		const { container } = render(<RagText>Default tag</RagText>)
		expect(container.querySelector('p')).toBeTruthy()
		restore()
	})

	it('renders a custom element via the `as` prop', () => {
		const restore = mockOffsetWidth(300)
		const { container } = render(<RagText as="h2">Heading</RagText>)
		expect(container.querySelector('h2')).toBeTruthy()
		expect(container.querySelector('p')).toBeFalsy()
		restore()
	})

	it('forwards className prop', () => {
		const restore = mockOffsetWidth(300)
		const { container } = render(<RagText className="my-class">Text</RagText>)
		expect(container.querySelector('.my-class')).toBeTruthy()
		restore()
	})

	it('forwards aria-label prop', () => {
		const restore = mockOffsetWidth(300)
		const { getByLabelText } = render(
			<RagText aria-label="accessible label">Text</RagText>,
		)
		expect(getByLabelText('accessible label')).toBeTruthy()
		restore()
	})

	it('forwards data- attributes', () => {
		const restore = mockOffsetWidth(300)
		const { container } = render(
			<RagText data-testid="rag-block">Text</RagText>,
		)
		const el = container.querySelector('[data-testid="rag-block"]')
		expect(el).toBeTruthy()
		restore()
	})

	it('accepts all RagOptions as props without throwing', () => {
		const restore = mockOffsetWidth(300)
		expect(() =>
			render(
				<RagText
					sawDepth={80}
					sawPeriod={2}
					sawPhase={2}
					maxTracking={0.7}
					sawAlign="bottom"
					resize={false}
				>
					Options test
				</RagText>,
			),
		).not.toThrow()
		restore()
	})

	it('mounts and unmounts without throwing', () => {
		const restore = mockOffsetWidth(300)
		let unmount: () => void
		expect(() => {
			;({ unmount } = render(<RagText>Mount test</RagText>))
		}).not.toThrow()
		expect(() => {
			unmount!()
		}).not.toThrow()
		restore()
	})

	it('accepts a forwarded ref without throwing', () => {
		const restore = mockOffsetWidth(300)
		const ref = React.createRef<HTMLElement>()
		expect(() =>
			render(<RagText ref={ref}>With ref</RagText>),
		).not.toThrow()
		restore()
	})
})
