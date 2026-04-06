// Component wrapper around useRag for declarative usage
import React, { forwardRef } from 'react'
import { useRag } from './useRag'
import type { RagOptions } from '../core/types'

export interface RagTextProps extends RagOptions {
	/** Text content to adjust. String children are tracked automatically — no key prop needed on content change. */
	children: React.ReactNode
	/** HTML element to render. @default "p" */
	as?: React.ElementType
	className?: string
	style?: React.CSSProperties
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
 * String children are automatically tracked — no key prop needed when content changes.
 * For non-string children (JSX nodes), pass a key prop if content changes dynamically.
 */
export const RagText = forwardRef<HTMLElement, RagTextProps>(function RagText(
	{ children, as: Tag = 'p', sawDepth, sawPeriod, maxTracking, ragDifference, sawAlign, className, style },
	forwardedRef,
) {
	// Derive a stable content key from string children so the hook can
	// auto-reset its snapshot without requiring a key prop from the caller.
	const contentKey = typeof children === 'string' ? children : undefined

	const { ref } = useRag({ sawDepth, sawPeriod, maxTracking, ragDifference, sawAlign }, contentKey)

	// Merge the internal ref with any forwarded ref
	const mergedRef = (el: HTMLElement | null) => {
		;(ref as React.MutableRefObject<HTMLElement | null>).current = el
		if (typeof forwardedRef === 'function') {
			forwardedRef(el)
		} else if (forwardedRef) {
			forwardedRef.current = el
		}
	}

	return (
		<Tag ref={mergedRef} className={className} style={style}>
			{children}
		</Tag>
	)
})
