"use client"

// Interactive saw-rag demo with live controls
import { useState } from "react"
import { RagText } from "ragtooth"

const SAMPLE =
	"Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing. Type design is a closely related craft, sometimes considered part of typography."

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
			<div className="flex justify-between text-xs uppercase tracking-widest opacity-50">
				<span>{label}</span>
				<span className="tabular-nums">{value}</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		</div>
	)
}

export default function Demo() {
	const [sawDepth, setSawDepth] = useState(120)
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
			<RagText
				sawDepth={sawDepth}
				sawPeriod={sawPeriod}
				maxTracking={maxTracking}
				style={{ fontFamily: "Merriweather, serif", fontSize: "1.0625rem", lineHeight: "1.7" }}
			>
				{SAMPLE}
			</RagText>
		</div>
	)
}
