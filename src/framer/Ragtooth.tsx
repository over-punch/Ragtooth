// ragtooth/src/framer/Ragtooth.tsx — Framer code component wrapping the ragtooth core.
//
// Distribution: paste this file into Framer (Insert → Code → New Component), or host it as an
// ES module and add it by URL. It imports the framework-agnostic core straight from the CDN, so
// it needs no build step — the core functions take a DOM element, not React, so there is no
// React version/externalisation issue.
//
// ragtooth is an APPLY-ONCE tool: applyRag rewrites the container in place (no rAF loop, no
// start/stop). Its output depends on the container's rendered width, so — mirroring the proven
// useRag hook — this component re-runs applyRag whenever the width changes via a ResizeObserver.
// The only Framer-specific additions are the property controls and layout annotations.
import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
// Pin to a published version so shared instances stay stable. Bump when the core changes.
// The core is framework-agnostic (operates on a DOM element), so no React externalisation is needed.
import { applyRag, removeRag, getCleanHTML } from "https://esm.sh/@liiift-studio/ragtooth@1.2.29"

/** Props surfaced to the Framer UI via addPropertyControls, plus base text styling.
 *  Option fields are declared explicitly so the component needs no type import over HTTP. */
interface RagtoothFramerProps {
	/** The paragraph text to shape into a sawtooth rag. */
	text: string
	/** CSS font-family. Any font works — ragtooth adjusts line width and letter-spacing. */
	fontFamily: string
	/** Font size in px. */
	fontSize: number
	/** Text colour. */
	color: string
	/** Horizontal text alignment. */
	textAlign: "left" | "center" | "right"
	/** How far short lines are pulled in from full width, in px. Higher = more pronounced saw. */
	sawDepth: number
	/** How many lines per saw cycle. 2 = classic alternating (full, short, full, short). */
	sawPeriod: number
	/** Maximum letter-spacing any line can receive, in px. Caps stretch on very short lines. */
	maxTracking: number
	/** Which line within each period cycle is shortened (1-indexed). Clamped to [1, sawPeriod]. */
	sawPhase: number
	/** Anchor the cycle to the top or bottom of the block. 'bottom' keeps the ending full-width. */
	sawAlign: "top" | "bottom"
	/** Re-run the adjustment when the container's width changes (ResizeObserver). */
	resize: boolean
}

/**
 * Deliberate sawtooth rag, as a Framer code component.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Ragtooth(props: Partial<RagtoothFramerProps>) {
	const {
		text = "Deliberate sawtooth rag gives a block of type a quiet, engineered edge that a browser's greedy wrap never will.",
		fontFamily = "Georgia, serif",
		fontSize = 28,
		color = "#111111",
		textAlign = "left",
		sawDepth = 80,
		sawPeriod = 2,
		maxTracking = 0.7,
		sawPhase = 2,
		sawAlign = "top",
		resize = true,
	} = props

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const options = { sawDepth, sawPeriod, maxTracking, sawPhase, sawAlign, resize }

		// Snapshot the clean HTML once, then run the real apply-once adjustment.
		const original = getCleanHTML(el)
		applyRag(el, original, options)

		// Output depends on container width — re-run on width change, matching useRag.
		// (This is responsive re-layout, not animation, so it runs on every render target.)
		let observer: ResizeObserver | undefined
		if (resize && typeof ResizeObserver !== "undefined") {
			let lastWidth = Math.round(el.getBoundingClientRect().width)
			observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const width = Math.round(entry.contentRect.width)
					if (width === lastWidth) continue
					lastWidth = width
					applyRag(el, original, options)
				}
			})
			observer.observe(el)
		}

		return () => {
			observer?.disconnect()
			removeRag(el, original)
		}
	}, [text, fontFamily, fontSize, sawDepth, sawPeriod, maxTracking, sawPhase, sawAlign, resize])

	return (
		<div
			ref={ref}
			style={{
				fontFamily,
				fontSize,
				color,
				textAlign,
				lineHeight: 1.35,
				width: "100%",
			}}
		>
			{text}
		</div>
	)
}

// Map every meaningful RagOptions field to a Framer control.
// Omitted: `ragDifference` (deprecated alias for sawDepth). RagValue's string-unit forms
// (e.g. "20%", "2em") are surfaced as plain px Numbers here for a simpler control surface.
addPropertyControls(Ragtooth, {
	text: {
		type: ControlType.String,
		title: "Text",
		defaultValue:
			"Deliberate sawtooth rag gives a block of type a quiet, engineered edge that a browser's greedy wrap never will.",
		displayTextArea: true,
	},
	fontFamily: {
		type: ControlType.String,
		title: "Font",
		defaultValue: "Georgia, serif",
		description: "Any font works — ragtooth adjusts line width and letter-spacing.",
	},
	fontSize: { type: ControlType.Number, title: "Size", defaultValue: 28, min: 8, max: 200, unit: "px" },
	color: { type: ControlType.Color, title: "Colour", defaultValue: "#111111" },
	textAlign: {
		type: ControlType.Enum,
		title: "Align",
		options: ["left", "center", "right"],
		optionTitles: ["Left", "Center", "Right"],
		defaultValue: "left",
		displaySegmentedControl: true,
	},
	sawDepth: {
		type: ControlType.Number,
		title: "Saw Depth",
		defaultValue: 80,
		min: 0,
		max: 400,
		unit: "px",
		description: "How far short lines pull in. Higher = more pronounced sawtooth.",
	},
	sawPeriod: {
		type: ControlType.Number,
		title: "Saw Period",
		defaultValue: 2,
		min: 2,
		max: 8,
		step: 1,
		description: "Lines per cycle. 2 = full, short, full, short.",
	},
	maxTracking: {
		type: ControlType.Number,
		title: "Max Tracking",
		defaultValue: 0.7,
		min: 0,
		max: 8,
		step: 0.1,
		unit: "px",
		description: "Caps letter-spacing so short lines aren't stretched grotesquely.",
	},
	sawPhase: {
		type: ControlType.Number,
		title: "Saw Phase",
		defaultValue: 2,
		min: 1,
		max: 8,
		step: 1,
		description: "Which line in each cycle is shortened (1-indexed). Clamped to Saw Period.",
	},
	sawAlign: {
		type: ControlType.Enum,
		title: "Align Cycle",
		options: ["top", "bottom"],
		optionTitles: ["Top", "Bottom"],
		defaultValue: "top",
		description: "'Bottom' keeps the paragraph ending full-width.",
	},
	resize: {
		type: ControlType.Boolean,
		title: "Track Resize",
		defaultValue: true,
		enabledTitle: "On",
		disabledTitle: "Off",
	},
})
