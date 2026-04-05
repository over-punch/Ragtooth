// Demo app — live preview of rag-rub with interactive controls
import { useState } from 'react'
import { RagText } from 'ragtooth'

const LOREM = [
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
	'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
	'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum quia dolor sit.',
]

/** Range input with a label showing the current value */
function Control({
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
		<div className="control">
			<div className="control-header">
				<span className="control-label">{label}</span>
				<span className="control-value">{value}</span>
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

export default function App() {
	const [sawDepth, setSawDepth] = useState(120)
	const [sawPeriod, setSawPeriod] = useState(2)
	const [maxTracking, setMaxTracking] = useState(0.7)

	return (
		<div className="app">
			<header className="header">
				<h1 className="title">Ragtooth</h1>
				<p className="subtitle">Deliberate saw rag for the web</p>
			</header>

			<div className="controls">
				<Control
					label="Saw Depth"
					value={sawDepth}
					min={0}
					max={400}
					step={1}
					onChange={setSawDepth}
				/>
				<Control
					label="Saw Period"
					value={sawPeriod}
					min={2}
					max={6}
					step={1}
					onChange={setSawPeriod}
				/>
				<Control
					label="Max Tracking"
					value={maxTracking}
					min={0}
					max={2}
					step={0.01}
					onChange={setMaxTracking}
				/>
			</div>

			<div className="text-block">
				{LOREM.map((text, i) => (
					<RagText
						key={`${sawDepth}-${sawPeriod}-${maxTracking}-${i}`}
						sawDepth={sawDepth}
						sawPeriod={sawPeriod}
						maxTracking={maxTracking}
					>
						{text}
					</RagText>
				))}
			</div>
		</div>
	)
}
