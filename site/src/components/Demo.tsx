"use client"

// Interactive sawtooth rag demo with live controls and rich typographic sample text
import { useState, useEffect, useDeferredValue } from "react"
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
		for nearly any paragraph. Start with depth around <strong>15–20%</strong>{' '}of your
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
				aria-label={label}
				onChange={(e) => onChange(Number(e.target.value))}
				onTouchStart={(e) => e.stopPropagation()}
				style={{ touchAction: 'none' }}
			/>
			<span className="tabular-nums text-xs opacity-50 text-right">{value}</span>
		</div>
	)
}

/** Before/after toggle — left half = without effect, right half filled = with effect */
function BeforeAfterToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			aria-label="Toggle before/after comparison"
			title={active ? 'Hide comparison' : 'Compare without effect'}
			style={{
				position: 'absolute', bottom: 0, right: 0,
				width: 32, height: 32, borderRadius: '50%',
				border: '1px solid currentColor',
				opacity: active ? 0.8 : 0.25,
				background: 'transparent',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				cursor: 'pointer', transition: 'opacity 0.15s ease',
			}}
		>
			<svg width="14" height="10" viewBox="0 0 14 10" fill="none">
				<rect x="0.5" y="0.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1"/>
				<line x1="7" y1="0.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1"/>
				<rect x="8" y="1.5" width="5" height="7" fill="currentColor"/>
			</svg>
		</button>
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

/** Gyroscope icon SVG — circle with rotation arrow */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
			<circle cx="7" cy="7" r="5.5" />
			<circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
			<path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.4" />
			<path d="M11.5 5.5 L12.5 7 L13.8 6" strokeWidth="1.2" />
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
	const [resize, setResize] = useState(true)

	// Before/after comparison toggle
	const [beforeAfter, setBeforeAfter] = useState(false)

	// Interaction modes — mutually exclusive
	const [cursorMode, setCursorMode] = useState(false)
	const [gyroMode, setGyroMode] = useState(false)

	// Gyro-driven values — kept separate from slider state so slider value props
	// never change during gyro mode (which would cause mobile to scroll to the input)
	const [gyroDepth, setGyroDepth] = useState(160)
	const [gyroTracking, setGyroTracking] = useState(0.7)

	// Detected capabilities — resolved client-side after mount
	const [showCursor, setShowCursor] = useState(false)
	const [showGyro, setShowGyro] = useState(false)

	useEffect(() => {
		const isHover = window.matchMedia('(hover: hover)').matches
		const isTouch = window.matchMedia('(hover: none)').matches
		setShowCursor(isHover)
		setShowGyro(isTouch && 'DeviceOrientationEvent' in window)
	}, [])

	// Keep sawPhase in range when sawPeriod changes
	const effectiveSawPhase = Math.min(sawPhase, sawPeriod)

	// Effective values: gyro-driven when gyroMode is active, slider-driven otherwise
	const effectiveDepth = gyroMode ? gyroDepth : sawDepth
	const effectiveTracking = gyroMode ? gyroTracking : maxTracking

	// Defer the rag computation so rapid slider drags don't block paint on slow devices.
	// The slider value updates immediately; the expensive DOM rewrite follows when idle.
	const deferredDepth = useDeferredValue(effectiveDepth)
	const deferredPeriod = useDeferredValue(sawPeriod)
	const deferredPhase = useDeferredValue(effectiveSawPhase)
	const deferredTracking = useDeferredValue(effectiveTracking)
	const deferredAlign = useDeferredValue(sawAlign)
	const deferredResize = useDeferredValue(resize)

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

	// Gyro mode — left/right tilt (gamma) controls depth, front/back tilt (beta) controls tracking.
	// Updates gyroDepth/gyroTracking (not slider state) so slider value props stay frozen,
	// preventing mobile browsers from scrolling to the input on each orientation update.
	// rAF throttle limits re-renders to one per frame.
	useEffect(() => {
		if (!gyroMode) return
		let rafId: number | null = null
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				rafId = null
				if (e.gamma !== null) {
					// gamma: -90 (tilt left) to 90 (tilt right) → depth 0–400
					setGyroDepth(Math.round(((e.gamma + 90) / 180) * 400))
				}
				if (e.beta !== null) {
					// beta when holding portrait: ~90 upright, decreases when tilted back toward you
					// Clamp to [15, 90] (avoids flat-on-table extremes) then invert: tilt back = more tracking
					const clamped = Math.max(15, Math.min(90, e.beta))
					setGyroTracking(parseFloat(((90 - clamped) / 75 * 2).toFixed(2)))
				}
			})
		}
		window.addEventListener('deviceorientation', handleOrientation)
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation)
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [gyroMode])

	// Toggle cursor mode — turns off gyro if active
	const toggleCursor = () => {
		setGyroMode(false)
		setCursorMode(v => !v)
	}

	// Toggle gyro mode — requests iOS permission if needed, turns off cursor if active
	const toggleGyro = async () => {
		if (gyroMode) {
			setGyroMode(false)
			return
		}
		setCursorMode(false)
		const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
			requestPermission?: () => Promise<PermissionState>
		}
		if (typeof DOE.requestPermission === 'function') {
			const permission = await DOE.requestPermission()
			if (permission === 'granted') setGyroMode(true)
		} else {
			setGyroMode(true)
		}
	}

	const sampleStyle: React.CSSProperties = {
		fontFamily: "var(--font-merriweather), serif",
		fontSize: "1.125rem",
		lineHeight: "1.8",
		fontVariationSettings: '"wght" 300, "opsz" 18, "wdth" 100',
	}

	const activeMode = cursorMode || gyroMode

	return (
		<div className="w-full">
			{/* Rag controls */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
				<Slider label="Depth"    value={sawDepth}          min={0}   max={400}      step={1}    onChange={setSawDepth} />
				<Slider label="Period"   value={sawPeriod}         min={2}   max={6}        step={1}    onChange={setSawPeriod} />
				<Slider label="Phase"    value={effectiveSawPhase} min={1}   max={sawPeriod} step={1}   onChange={setSawPhase} />
				<Slider label="Tracking" value={maxTracking}       min={0}   max={2}        step={0.01} onChange={setMaxTracking} />
			</div>

			{/* Align toggle + resize toggle + cursor/gyro mode toggle */}
			<div className="flex flex-wrap items-center gap-3 mb-8">
				<span className="text-xs uppercase tracking-widest opacity-50">Align</span>
				{(["top", "bottom"] as const).map((v) => (
					<button
						key={v}
						onClick={() => setSawAlign(v)}
						className="text-xs px-3 py-1 rounded-full border transition-opacity"
						style={{
							borderColor: "currentColor",
							opacity: sawAlign === v ? 1 : 0.5,
							background: sawAlign === v ? "var(--btn-bg)" : "transparent",
						}}
					>
						{v}
					</button>
				))}
				<span className="text-xs opacity-50">
					{sawAlign === "bottom" ? "— period counts from last line up" : "— period counts from first line down"}
				</span>

				<span className="text-xs uppercase tracking-widest opacity-50 ml-4">Resize</span>
				{([true, false] as const).map((v) => (
					<button
						key={String(v)}
						onClick={() => setResize(v)}
						className="text-xs px-3 py-1 rounded-full border transition-opacity"
						style={{
							borderColor: "currentColor",
							opacity: resize === v ? 1 : 0.5,
							background: resize === v ? "var(--btn-bg)" : "transparent",
						}}
					>
						{v ? "auto" : "off"}
					</button>
				))}

				{/* Cursor mode — desktop/hover-capable devices only */}
				{showCursor && (
					<button
						onClick={toggleCursor}
						title="Move your cursor to control depth (X) and tracking (Y)"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ml-auto"
						style={{
							borderColor: "currentColor",
							opacity: cursorMode ? 1 : 0.5,
							background: cursorMode ? "var(--btn-bg)" : "transparent",
						}}
					>
						<CursorIcon />
						<span>{cursorMode ? 'Esc to exit' : '?'}</span>
					</button>
				)}

				{/* Gyro mode — touch devices with DeviceOrientationEvent */}
				{showGyro && (
					<button
						onClick={toggleGyro}
						title="Tilt your device to control depth (left/right) and tracking (front/back)"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ml-auto"
						style={{
							borderColor: "currentColor",
							opacity: gyroMode ? 1 : 0.5,
							background: gyroMode ? "var(--btn-bg)" : "transparent",
						}}
					>
						<GyroIcon />
						<span>{gyroMode ? 'Tilt active' : 'Tilt'}</span>
					</button>
				)}
			</div>

			{/* Live text */}
			<div className="relative pb-8">
				<div className="flex flex-col gap-5">
					{PARAGRAPHS.map((para, i) => (
						<RagText
							key={i}
							sawDepth={deferredDepth}
							sawPeriod={deferredPeriod}
							sawPhase={deferredPhase}
							maxTracking={deferredTracking}
							sawAlign={deferredAlign}
							resize={deferredResize}
							style={sampleStyle}
						>
							{para}
						</RagText>
					))}
				</div>
				{beforeAfter && (
					<div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', opacity: 0.25 }}>
						<div className="flex flex-col gap-5">
							{PARAGRAPHS.map((para, i) => (
								<p key={i} style={sampleStyle}>{para}</p>
							))}
						</div>
					</div>
				)}
				<BeforeAfterToggle active={beforeAfter} onClick={() => setBeforeAfter(v => !v)} />
			</div>

			{/* Caption */}
			<div className="flex items-center gap-3 mt-6">
				{activeMode && (
					<p className="text-xs opacity-50 italic">
						{cursorMode ? 'Move cursor to adjust depth and tracking. Press Esc to exit.' : 'Tilt left/right for depth, front/back for tracking.'}
					</p>
				)}
				{!activeMode && (
					<p className="text-xs opacity-50 italic">
						Yes, we used small-caps, bold, italic, and a number in the same paragraph. We wanted to make sure the tool doesn&apos;t break.
					</p>
				)}
			</div>
		</div>
	)
}
