// Component wrapper around useRag for declarative usage
import React, { Children, forwardRef, isValidElement } from 'react'
import { useRag } from './useRag'
import type { RagOptions } from '../core/types'

export interface RagTextProps extends RagOptions, React.HTMLAttributes<HTMLElement> {
	/** Content to adjust. Changes are tracked automatically (JSX included) — no key prop needed. */
	children: React.ReactNode
	/** HTML element to render. @default "p" */
	as?: React.ElementType
}

/**
 * Renders a block of text with rag adjustment applied.
 *
 * Basic usage:
 * ```tsx
 * <RagText sawDepth={80} maxTracking={0.7}>
 *   Lorem ipsum dolor sit amet...
 * </RagText>
 * ```
 *
 * With a custom element:
 * ```tsx
 * <RagText as="h2" sawDepth={40}>Heading text</RagText>
 * ```
 *
 * Children are tracked automatically — no key prop needed when content changes, JSX included.
 */
/**
 * A string that changes whenever the rendered content of `children` changes: text, element types,
 * keys and primitive props, walked recursively. Functions and objects are ignored.
 */
function childrenSignature(children: React.ReactNode): string {
	const parts: string[] = []
	const walk = (node: React.ReactNode) => {
		Children.forEach(node, (child) => {
			if (child === null || child === undefined || typeof child === 'boolean') return
			if (typeof child === 'string' || typeof child === 'number') { parts.push(String(child)); return }
			if (isValidElement(child)) {
				const type = typeof child.type === 'string' ? child.type : ((child.type as { displayName?: string; name?: string }).displayName ?? (child.type as { name?: string }).name ?? 'C')
				const props = child.props as Record<string, unknown>
				const attrs = Object.keys(props).filter((k) => k !== 'children' && ['string', 'number', 'boolean'].includes(typeof props[k])).sort().map((k) => `${k}=${String(props[k])}`)
				parts.push(`<${type}${child.key != null ? '#' + child.key : ''} ${attrs.join(' ')}>`)
				walk(props.children as React.ReactNode)
				parts.push(`</${type}>`)
			}
		})
	}
	walk(children)
	return parts.join('\u0000')
}

export const RagText = forwardRef<HTMLElement, RagTextProps>(function RagText(
	{ children, as: Tag = 'p', sawDepth, sawPeriod, sawPhase, maxTracking, ragDifference, sawAlign, resize, ...htmlProps },
	forwardedRef,
) {
	// A key derived from the children's content (text, elements, keys, primitive props), so the
	// hook re-snapshots and the element remounts when any of it changes — JSX children included.
	// The library rebuilds the element's DOM, so React can't patch new children into it.
	// The tag is part of the key: a new `as` is a new element, which needs its own run.
	const contentKey = `${typeof Tag === 'string' ? Tag : 'C'}|${childrenSignature(children)}`

	const { ref } = useRag({ sawDepth, sawPeriod, sawPhase, maxTracking, ragDifference, sawAlign, resize }, contentKey)

	// Merge the internal ref with any forwarded ref using a callback ref so the
	// hook's internal ref (which may be readonly in React 19) is assigned safely.
	const mergedRef = (el: HTMLElement | null) => {
		;(ref as React.MutableRefObject<HTMLElement | null>).current = el
		if (typeof forwardedRef === 'function') {
			forwardedRef(el)
		} else if (forwardedRef) {
			forwardedRef.current = el
		}
	}

	// Spread remaining HTML attributes (aria-*, role, id, data-*, className, style, etc.)
	// so consumers can attach accessibility and test attributes without a wrapper element.
	return (
		<Tag key={contentKey} ref={mergedRef} {...htmlProps}>
			{children}
		</Tag>
	)
})
