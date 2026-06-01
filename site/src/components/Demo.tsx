"use client"

// Interactive sawtooth rag demo with live controls and rich typographic sample text
import { useState, useEffect, useDeferredValue, useCallback, useId } from "react"
import type { ReactNode } from "react"
import { RagText } from "@liiift-studio/ragtooth"

// Rich sample text — italic for terms, bold small-caps opener, numbers, mixed rhythms.
// Keyed objects avoid React's unkeyed-fragment dev warning when mapping.
const PARAGRAPHS: { key: string; node: ReactNode }[] = [
	{
		key: "p0",
		node: (
			<>
				<span style={{ fontFeatureSettings: "'smcp', 'c2sc'", fontVariantCaps: "all-small-caps", fontVariationSettings: '"wght" 700, "opsz" 18, "wdth" 100' }}>Typography traces its formal origins to Gutenberg&rsquo;s press of 1455</span>,
				where <em>justified setting</em> and careful letter-spacing were discipline before
				they were decoration. The difference between fine and ordinary typesetting has
				always been about rhythm — how the eye moves, and where it rests. A ragged-right
				setting has a bad reputation, most of it <em>unearned</em>. The trouble is never
				the rag itself but the shape it falls into — accidental, without rhythm. Set in a
				typeface with strong descenders and a generous <em>x-height</em>, a sawtooth rag
				can feel as considered as full justification. The difference is
				simply that the decision is yours rather than the browser&rsquo;s.
			</>
		),
	},
	{
		key: "p1",
		node: (
			<>
				These <strong>three controls</strong> — depth, period, and tracking — are enough
				for nearly any paragraph. Start with depth around <strong>15–20%</strong> of your
				line length, keep the period at&nbsp;2 for the classic sawtooth, and hold tracking
				just above zero. The fine-tuning is yours to find.
			</>
		),
	},
]

// Module-level constant — no runtime values, so no need for useMemo.
const SAMPLE_STYLE: React.CSSProperties = {
	fontFamily: "var(--font-merriweather), serif",
	fontSize: "1.125rem",
	lineHeight: "1.8",
	fontVariationSettings: '"wght" 300, "opsz" 18, "wdth" 100',
}

/** Labelled range slider with value displayed below the track */
function Slider({
	label,
	title,
	value,
	unit,
	min,
	max,
	step,
	onChange,
}: {
	label: string
	title?: string
	value: number
	/** Optional unit suffix shown in the value display and aria-valuetext */
	unit?: string
	min: number
	max: number
	step: number
	onChange: (v: number) => void
}) {
	const valueId = useId()
	const displayValue = unit ? `${value}${unit}` : String(value)
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
				aria-valuetext={displayValue}
				aria-describedby={valueId}
				title={title}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
			<span id={valueId} className="tabular-nums text-xs opacity-50 text-right">{displayValue}</span>
		</div>
	)
}

/** Before/after toggle — left half = without effect, right half filled = with effect */
function BeforeAfterToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			aria-pressed={active}
			aria-label={active ? 'Showing unragged comparison overlay — click to hide' : 'Show unragged text as a comparison overlay'}
			title={active ? 'Hide comparison' : 'Compare without effect'}
			style={{
				position: 'absolute', bottom: 0, right: 0,
				width: 32, height: 32, borderRadius: '50%',
				border: '1px solid currentColor',
				opacity: active ? 0.8 : 0.25,
				background: 'transparent',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				cursor: 'pointer', transition: 'opacity 0.15s ease',
				outline: 'revert',
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
	// Rag controls — sawDepth defaults to 160 here as an intentionally exaggerated demo value;
	// the library default is 80 (see options table). A comment in the UI makes this explicit.
	const [sawDepth, setSawDepth] = useState(160)
	const [sawPeriod, setSawPeriod] = useState(2)
	const [sawPhase, setSawPhase] = useState(2)
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

	// Keep sawPhase in range when sawPeriod changes — clamp both the effective value
	// passed to RagText AND the slider state so the displayed label stays in sync.
	const effectiveSawPhase = Math.min(sawPhase, sawPeriod)
	useEffect(() => {
		if (sawPhase > sawPeriod) setSawPhase(sawPeriod)
	}, [sawPeriod, sawPhase])

	// Effective values: gyro-driven when gyroMode is active, slider-driven otherwise
	const effectiveDepth = gyroMode ? gyroDepth : sawDepth
	const effectiveTracking = gyroMode ? gyroTracking : maxTracking

	// Defer continuous slider values so rapid drags don't block paint on slow devices.
	// Discrete toggle values (sawAlign, resize) are not deferred — deferring them adds
	// a pointless extra render pass on an infrequent click event.
	const deferredDepth = useDeferredValue(effectiveDepth)
	const deferredPeriod = useDeferredValue(sawPeriod)
	const deferredPhase = useDeferredValue(effectiveSawPhase)
	const deferredTracking = useDeferredValue(effectiveTracking)

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

	// Status message for aria-live region — announces mode changes to screen readers
	const [statusMsg, setStatusMsg] = useState("")

	// Toggle cursor mode — turns off gyro if active
	const toggleCursor = useCallback(() => {
		setGyroMode(false)
		setCursorMode(v => {
			const next = !v
			setStatusMsg(next ? 'Cursor mode active. Move cursor to adjust depth and tracking. Press Escape to exit.' : 'Cursor mode off.')
			return next
		})
	}, [])

	// Toggle gyro mode — requests iOS permission if needed, turns off cursor if active.
	// Wrapped in try/catch so a rejected or thrown requestPermission surfaces a message
	// rather than an unhandled rejection.
	const toggleGyro = useCallback(async () => {
		if (gyroMode) {
			setGyroMode(false)
			setStatusMsg('Tilt mode off.')
			return
		}
		setCursorMode(false)
		try {
			// DOE.requestPermission is a non-standard iOS Safari extension — typed via intersection.
			const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
				requestPermission?: () => Promise<PermissionState>
			}
			if (typeof DOE.requestPermission === 'function') {
				const permission = await DOE.requestPermission()
				if (permission === 'granted') {
					setGyroMode(true)
					setStatusMsg('Tilt mode active. Tilt left/right for depth, front/back for tracking.')
				} else {
					// Permission denied or prompt already dismissed — surface a message so the
					// button does not appear broken. iOS shows the permission dialog only once.
					setStatusMsg('Motion access was denied. Check your device privacy settings to re-enable it.')
				}
			} else {
				setGyroMode(true)
				setStatusMsg('Tilt mode active. Tilt left/right for depth, front/back for tracking.')
			}
		} catch {
			setStatusMsg('Could not access device orientation. Check privacy settings and try again.')
		}
	}, [gyroMode])

	const activeMode = cursorMode || gyroMode

	return (
		<div className="w-full">
			{/* Screen-reader live region — announces mode changes and permission errors */}
			<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
				{statusMsg}
			</div>

			{/* Rag controls */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
				<Slider label="Depth"    unit="px" title="How far lines deviate from the maximum line width — higher values create a more pronounced sawtooth shape"    value={sawDepth}          min={0}   max={400}      step={1}    onChange={setSawDepth} />
				<Slider label="Period"         title="How many lines complete one full rag cycle — 2 gives a classic alternating long/short sawtooth"         value={sawPeriod}         min={2}   max={6}        step={1}    onChange={setSawPeriod} />
				<Slider label="Phase"          title="Which step in the cycle the first line lands on — shift this to avoid awkward breaks at the paragraph opening"    value={effectiveSawPhase} min={1}   max={sawPeriod} step={1}   onChange={setSawPhase} />
				<Slider label="Tracking" unit="px" title="How much letter-spacing ragtooth may add to nudge a line shorter — keep this low to avoid noticeable spacing changes" value={maxTracking}       min={0}   max={2}        step={0.01} onChange={setMaxTracking} />
			</div>

			{/* Align toggle + resize toggle + cursor/gyro mode toggle */}
			<div className="flex flex-wrap items-center gap-3 mb-8">
				<span className="text-xs uppercase tracking-widest opacity-50">Align</span>
				{(["top", "bottom"] as const).map((v) => (
					<button
						key={v}
						onClick={() => setSawAlign(v)}
						aria-pressed={sawAlign === v}
						title={v === "top" ? "Count the rag cycle from the first line downward — the sawtooth starts at the paragraph opening" : "Count the rag cycle from the last line upward — the sawtooth resolves cleanly at the paragraph end"}
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
						aria-pressed={resize === v}
						title={v ? "Recalculate line breaks whenever the container width changes — keeps the rag accurate after window resize" : "Fix line breaks at their current width and skip resize recalculation — useful for performance testing"}
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

				{/* Cursor and gyro buttons share a right-side slot — only one renders at a time,
				    so a single ml-auto wrapper keeps them flush right without double-spacing. */}
				{(showCursor || showGyro) && (
					<div className="ml-auto flex gap-2">
						{/* Cursor mode — desktop/hover-capable devices only */}
						{showCursor && (
							<button
								onClick={toggleCursor}
								aria-pressed={cursorMode}
								title="Move your cursor to control depth (X) and tracking (Y)"
								className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
								style={{
									borderColor: "currentColor",
									opacity: cursorMode ? 1 : 0.5,
									background: cursorMode ? "var(--btn-bg)" : "transparent",
								}}
							>
								<CursorIcon />
								<span>{cursorMode ? 'Esc to exit' : 'Cursor'}</span>
							</button>
						)}

						{/* Gyro mode — touch devices with DeviceOrientationEvent */}
						{showGyro && (
							<button
								onClick={toggleGyro}
								aria-pressed={gyroMode}
								title="Tilt your device to control depth (left/right) and tracking (front/back)"
								className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
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
				)}
			</div>

			{/* Live text */}
			<div className="relative pb-8">
				<div className="flex flex-col gap-8">
					{PARAGRAPHS.map(({ key, node }) => (
						<RagText
							key={key}
							sawDepth={deferredDepth}
							sawPeriod={deferredPeriod}
							sawPhase={deferredPhase}
							maxTracking={deferredTracking}
							sawAlign={sawAlign}
							resize={resize}
							style={SAMPLE_STYLE}
						>
							{node}
						</RagText>
					))}
				</div>
				{beforeAfter && (
					<div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', opacity: 0.35 }}>
						<div className="flex flex-col gap-8">
							{PARAGRAPHS.map(({ key, node }) => (
								<p key={key} style={SAMPLE_STYLE}>{node}</p>
							))}
						</div>
					</div>
				)}
				<BeforeAfterToggle active={beforeAfter} onClick={() => setBeforeAfter(v => !v)} />
			</div>

			{/* Caption */}
			<div className="flex items-center gap-3 mt-8">
				{activeMode && (
					<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>
						{cursorMode ? 'Move cursor to adjust depth and tracking. Press Esc to exit.' : 'Tilt left/right for depth, front/back for tracking.'}
					</p>
				)}
				{!activeMode && (
					<p className="text-xs opacity-50 italic" style={{ lineHeight: "1.8" }}>
						Yes, we used small-caps, bold, italic, and a number in the same paragraph. We wanted to make sure the tool doesn&rsquo;t break. On e-readers and e-ink displays, a deliberate sawtooth rag also prevents the harsh reflow artefacts that appear when text redraws line by line on a slow-refresh screen. <span className="opacity-70">(Demo depth is 160px — the library default is 80px.)</span>
					</p>
				)}
			</div>
		</div>
	)
}
