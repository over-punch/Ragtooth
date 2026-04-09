import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import CodeBlock from "@/components/CodeBlock"
import ToolDirectory from "@/components/ToolDirectory"
import { version } from "../../../package.json"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-50">ragtooth</p>
					<h1
						className="text-4xl lg:text-8xl xl:text-9xl"
						style={{
							fontFamily: "var(--font-merriweather), serif",
							fontVariationSettings: '"wght" 300, "opsz" 144, "wdth" 87',
							lineHeight: "1.05em",
						}}
					>
						A Sawtooth Rag,<br />
						<span style={{ opacity: 0.5, fontStyle: "italic" }}>on the web.</span>
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a
						href="https://github.com/Liiift-Studio/Ragtooth"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm opacity-50 hover:opacity-100 transition-opacity"
					>
						GitHub ↗
					</a>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-50 tracking-wide">
					<span>TypeScript</span>
					<span>·</span>
					<span>Zero dependencies</span>
					<span>·</span>
					<span>React + Vanilla JS</span>
					<span>·</span>
					<span>~2.7kb gzipped</span>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					Most tools fight your rag. Ragtooth works with it — shaping text into a
					sawtooth pattern of alternating long and short lines. The kind of rhythm that
					reads as design, not accident. A technique from editorial typesetting, now
					in one fully-typed npm package.
				</p>
			</section>

			{/* Interactive demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest opacity-50">Live demo — drag the sliders</p>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "rgba(0,0,0,0.25)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* What is sawtooth rag */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-50">What is sawtooth rag?</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">The problem with smooth rag</p>
						<p>
							When text is set ragged-right, natural line endings create an
							unpredictable right edge — notches, peninsulas, near-rivers. It can look
							accidental. Most tools patch this with soft hyphens or non-breaking
							spaces: a lot of effort for a result that&apos;s still a mess.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">The case for sawtooth rag</p>
						<p>
							A sawtooth pattern — long line, short line, long line — gives the rag a
							rhythm. Structured, not random. The eye reads it as a choice. Book
							typographers and editorial designers have used it for decades. Now it
							takes thirty seconds.
						</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex items-baseline gap-4">
					<p className="text-xs uppercase tracking-widest opacity-50">Usage</p>
					<p className="text-xs opacity-50 tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Drop-in component</p>
						<CodeBlock code={`import { RagText } from 'ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook — attach to any element</p>
						<CodeBlock code={`import { useRag } from 'ragtooth'

const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })
<p ref={ref}>{children}</p>`} />
					</div>
				<div className="flex flex-col gap-3">
					<p className="opacity-50">Vanilla JS</p>
					<CodeBlock code={`import { applyRag, removeRag } from 'ragtooth'

const el = document.querySelector('p')
const original = el.innerHTML
applyRag(el, original, { sawDepth: 120, sawPeriod: 2 })`} />
				</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead>
								<tr className="opacity-50 text-left">
									<th className="pb-2 pr-6 font-normal">Option</th>
									<th className="pb-2 pr-6 font-normal">Default</th>
									<th className="pb-2 font-normal">Description</th>
								</tr>
							</thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawDepth</td>
									<td className="py-2 pr-6">80</td>
									<td className="py-2">How much shorter the short lines are. Higher = more pronounced sawtooth. Accepts px, %, em, rem, ch.</td>
								</tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawPeriod</td>
									<td className="py-2 pr-6">2</td>
									<td className="py-2">Lines per cycle. 2 = every other line short, 3 = two full then one short.</td>
								</tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawPhase</td>
									<td className="py-2 pr-6">sawPeriod</td>
									<td className="py-2">Which line within each cycle is shortened (1-indexed). Default is the last line of each cycle. Use with sawPeriod to place the short line exactly where you want it.</td>
								</tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawAlign</td>
									<td className="py-2 pr-6">&apos;top&apos;</td>
									<td className="py-2">Anchor the cycle to the top or bottom of the block. <span className="font-mono">&apos;bottom&apos;</span> with sawPeriod&nbsp;3 keeps the last two lines full — no awkward short penultimate line.</td>
								</tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">maxTracking</td>
									<td className="py-2 pr-6">0.7</td>
									<td className="py-2">Max letter-spacing (px, em, rem). Keeps lines from being stretched into oblivion.</td>
								</tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors">
									<td className="py-2 pr-6 font-mono">resize</td>
									<td className="py-2 pr-6">true</td>
									<td className="py-2">Re-runs the algorithm on container resize via ResizeObserver. Set false for static layouts.</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6 pt-8 border-t border-white/10 text-xs">
				<ToolDirectory current="ragtooth" />
				<div className="flex justify-between opacity-50">
					<span>ragtooth v{version}</span>
					<a
						href="https://liiift.studio"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:opacity-100 transition-opacity"
					>
						Liiift Studio
					</a>
				</div>
			</footer>

		</main>
	)
}
