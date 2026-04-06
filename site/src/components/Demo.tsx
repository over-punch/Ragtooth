"use client"

// Interactive saw-rag demo with live controls
import { useState } from "react"
import { RagText } from "ragtooth"

const PARAGRAPHS = [
	"Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing, and adjusting the space between pairs of letters.",
	"The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography. Most typographers do not design typefaces, and some type designers do not consider themselves typographers.",
	"In modern times, typography has been put into motion — giving new birth to an art form known as kinetic typography. This involves the movement of type in film and television and is commonly used in film credits and advertising.",
]

/** Labelled range slider */
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
				<Slider label="Saw Depth" value={sawDepth} min={0} max={400} step={1} onChange={setSawDepth} />
				<Slider label="Saw Period" value={sawPeriod} min={2} max={6} step={1} onChange={setSawPeriod} />
				<Slider label="Max Tracking" value={maxTracking} min={0} max={2} step={0.01} onChange={setMaxTracking} />
			</div>

			{/* Live text */}
			<div className="flex flex-col gap-5">
				{PARAGRAPHS.map((text, i) => (
					<RagText
						key={i}
						sawDepth={sawDepth}
						sawPeriod={sawPeriod}
						maxTracking={maxTracking}
						style={{ fontFamily: "Merriweather, serif", fontSize: "1.125rem", lineHeight: "1.8" }}
					>
						{text}
					</RagText>
				))}
			</div>
		</div>
	)
}
