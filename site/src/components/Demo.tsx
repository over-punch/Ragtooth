"use client"

// Interactive sawtooth rag demo with live controls and rich typographic sample text
import { useState } from "react"
import type { ReactNode } from "react"
import { RagText } from "ragtooth"

// Rich sample text — italic for terms, bold for concepts, natural ligature pairs
// (fi, fl, ff), numbers, and a mix of sentence rhythms.
const PARAGRAPHS: ReactNode[] = [
	<>
		Typography traces its formal origins to Gutenberg&apos;s press of <strong>1455</strong>,
		where <em>justified setting</em> and careful letter-spacing were discipline before
		they were decoration. The difference between fine and ordinary typesetting has
		always been about rhythm — how the eye moves, and where it rests.
	</>,
	<>
		A ragged-right setting has a bad reputation, most of it <em>unearned</em>. The
		trouble is never the rag itself but the shape it falls into — accidental, without
		rhythm. Set in a typeface with strong descenders and a generous <em>x-height</em>,
		a sawtooth rag can feel as considered as full justification. The difference is
		simply that the decision is yours rather than the browser&apos;s.
	</>,
	<>
		These <strong>three controls</strong> — depth, period, and tracking — are enough
		for nearly any paragraph. Start with depth around <strong>15–20%</strong> of your
		line length, keep the period at&nbsp;2 for the classic sawtooth, and hold tracking
		just above zero. The fine-tuning is yours to find.
	</>,
]

// OpenType features: common + discretionary ligatures, old-style numerals, kerning
const SAMPLE_STYLE: React.CSSProperties = {
	fontFamily: "Merriweather, serif",
	fontSize: "1.125rem",
	lineHeight: "1.8",
	fontFeatureSettings: '"liga" 1, "dlig" 1, "onum" 1, "kern" 1',
	fontVariantLigatures: "common-ligatures discretionary-ligatures",
	fontVariantNumeric: "oldstyle-nums",
}

/** Labelled range slider with value displayed below the track */
function Slider({
	label,
	value,
	min,
	max,
	step,
	onChange,
}: {
	label: string
	value: number
	min: number
	max: number
	step: number
	onChange: (v: number) => void
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs uppercase tracking-widest opacity-50">{label}</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
			<span className="tabular-nums text-xs opacity-40 text-right">{value}</span>
		</div>
	)
}

export default function Demo() {
	const [sawDepth, setSawDepth] = useState(160)
	const [sawPeriod, setSawPeriod] = useState(2)
	const [maxTracking, setMaxTracking] = useState(0.7)

	return (
		<div className="w-full max-w-2xl mx-auto">
			{/* Controls */}
			<div className="grid grid-cols-3 gap-6 mb-10">
				<Slider label="Depth"    value={sawDepth}    min={0}   max={400} step={1}    onChange={setSawDepth} />
				<Slider label="Period"   value={sawPeriod}   min={2}   max={6}   step={1}    onChange={setSawPeriod} />
				<Slider label="Tracking" value={maxTracking} min={0}   max={2}   step={0.01} onChange={setMaxTracking} />
			</div>

			{/* Live text */}
			<div className="flex flex-col gap-5">
				{PARAGRAPHS.map((para, i) => (
					<RagText
						key={i}
						sawDepth={sawDepth}
						sawPeriod={sawPeriod}
						maxTracking={maxTracking}
						style={SAMPLE_STYLE}
					>
						{para}
					</RagText>
				))}
			</div>
		</div>
	)
}
