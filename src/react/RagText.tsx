// Component wrapper around useRag for declarative usage
import React, { forwardRef } from 'react'
import { useRag } from './useRag'
import type { RagOptions } from '../core/types'

export interface RagTextProps extends RagOptions {
	/** Text content to adjust. Should be static — dynamic children require a key prop to re-snapshot. */
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
 * <RagText ragDifference={80} maxTracking={0.7}>
 *   Lorem ipsum dolor sit amet...
 * </RagText>
 * ```
 *
 * With a custom element:
 * ```tsx
 * <RagText as="h2" ragDifference={40}>Heading text</RagText>
 * ```
 *
 * If children change dynamically, pass a new `key` to force remount and re-snapshot:
 * ```tsx
 * <RagText key={content}>{content}</RagText>
 * ```
 */
export const RagText = forwardRef<HTMLElement, RagTextProps>(function RagText(
	{ children, as: Tag = 'p', sawDepth, sawPeriod, maxTracking, ragDifference, className, style },
	forwardedRef,
) {
	const { ref } = useRag({ sawDepth, sawPeriod, maxTracking, ragDifference })

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
