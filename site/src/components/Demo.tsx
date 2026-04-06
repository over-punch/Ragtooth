"use client"

// Interactive sawtooth rag demo with live controls and rich typographic sample text
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { RagText } from "ragtooth"

// Rich sample text — italic for terms, bold small-caps opener, numbers, mixed rhythms.
const PARAGRAPHS: ReactNode[] = [
	<>
		<span style={{ fontFeatureSettings: "'smcp', 'c2sc'", fontVariantCaps: "all-small-caps", fontVariationSettings: '"wght" 700, "opsz" 18, "wdth" 100' }}>Typography traces its formal origins to Gutenberg&apos;s press of 1455</span>,
		where <em>justified setting</em> and careful letter-spacing were discipline before
		they were decoration. The difference between fine and ordinary typesetting has
		always been about rhythm — how the eye moves, and where it rests. A ragged-right
		setting has a bad reputation, most of it <em>unearned</em>. The trouble is never
		the rag itself but the shape it falls into — accidental, without rhythm. Set in a
		typeface with strong descenders and a generous <em>x-height</em>, a sawtooth rag
		can feel as considered as full justification. The difference is
		simply that the decision is yours rather than the browser&apos;s.
	</>,
	<>
		These <strong>three controls</strong> — depth, period, and tracking — are enough
		for nearly any paragraph. Start with depth around <strong>15–20%</strong> of your
		line length, keep the period at&nbsp;2 for the classic sawtooth, and hold tracking
		just above zero. The fine-tuning is yours to find.
	</>,
]

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

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

export default function Demo() {
	// Rag controls
	const [sawDepth, setSawDepth] = useState(160)
	const [sawPeriod, setSawPeriod] = useState(2)
	const [sawPhase, setSawPhase] = useState(1)
	const [maxTracking, setMaxTracking] = useState(0.7)
	const [sawAlign, setSawAlign] = useState<"top" | "bottom">("bottom")
	const [cursorMode, setCursorMode] = useState(false)

	// Keep sawPhase in range when sawPeriod changes
	const effectiveSawPhase = Math.min(sawPhase, sawPeriod)

	// Cursor mode — X controls depth, Y controls tracking (inverted: up = more)
	useEffect(() => {
		if (!cursorMode) return
		const handleMove = (e: MouseEvent) => {
			setSawDepth(Math.round((e.clientX / window.innerWidth) * 400))
			setMaxTracking(parseFloat(((1 - e.clientY / window.innerHeight) * 2).toFixed(2)))
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode])

	const sampleStyle: React.CSSProperties = {
		fontFamily: "var(--font-merriweather), serif",
		fontSize: "1.125rem",
		lineHeight: "1.8",
		fontVariationSettings: '"wght" 300, "opsz" 18, "wdth" 100',
	}

	return (
		<div className="w-full">
			{/* Rag controls */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
				<Slider label="Depth"    value={sawDepth}          min={0}   max={400}      step={1}    onChange={setSawDepth} />
				<Slider label="Period"   value={sawPeriod}         min={2}   max={6}        step={1}    onChange={setSawPeriod} />
				<Slider label="Phase"    value={effectiveSawPhase} min={1}   max={sawPeriod} step={1}   onChange={setSawPhase} />
				<Slider label="Tracking" value={maxTracking}       min={0}   max={2}        step={0.01} onChange={setMaxTracking} />
			</div>

			{/* Align toggle */}
			<div className="flex items-center gap-3 mb-8">
				<span className="text-xs uppercase tracking-widest opacity-50">Align</span>
				{(["top", "bottom"] as const).map((v) => (
					<button
						key={v}
						onClick={() => setSawAlign(v)}
						className="text-xs px-3 py-1 rounded-full border transition-opacity"
						style={{
							borderColor: "currentColor",
							opacity: sawAlign === v ? 1 : 0.35,
							background: sawAlign === v ? "var(--btn-bg)" : "transparent",
						}}
					>
						{v}
					</button>
				))}
				<span className="text-xs opacity-30 ml-1">
					{sawAlign === "bottom" ? "— period counts from last line up" : "— period counts from first line down"}
				</span>
			</div>

			{/* Live text */}
			<div className="flex flex-col gap-5">
				{PARAGRAPHS.map((para, i) => (
					<RagText
						key={i}
						sawDepth={sawDepth}
						sawPeriod={sawPeriod}
						sawPhase={effectiveSawPhase}
						maxTracking={maxTracking}
						sawAlign={sawAlign}
						style={sampleStyle}
					>
						{para}
					</RagText>
				))}
			</div>

			{/* Cursor tool + caption — button only shown on hover-capable devices */}
			<div className="flex items-center gap-3 mt-6">
				<button
					onClick={() => setCursorMode(v => !v)}
					title="Move your cursor to control depth (X) and tracking (Y)"
					className="hidden [@media(hover:hover)]:flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
					style={{
						borderColor: "currentColor",
						opacity: cursorMode ? 1 : 0.35,
						background: cursorMode ? "var(--btn-bg)" : "transparent",
					}}
				>
					<CursorIcon />
					<span>?</span>
				</button>
				<p className="text-xs opacity-30 italic">
					Yes, we used small-caps, bold, italic, and a number in the same paragraph. We wanted to make sure the tool doesn&apos;t break.
				</p>
			</div>
		</div>
	)
}
