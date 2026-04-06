import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import { version } from "../../../package.json"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-40">ragtooth</p>
					<h1 className="text-4xl font-light leading-tight">
						Sawtooth rag<br />for the web.
					</h1>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					Most tools fight your rag. Ragtooth works with it — shaping text into a
					sawtooth pattern of alternating long and short lines. The kind of rhythm that
					reads as design, not accident. A technique from editorial typesetting, now
					in one npm package.
				</p>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a
						href="https://github.com/quitequinn/Ragtooth"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm opacity-40 hover:opacity-100 transition-opacity"
					>
						GitHub ↗
					</a>
				</div>
			</section>

			{/* Interactive demo */}
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-40">Live demo — drag the sliders</p>
				<Demo />
			</section>

			{/* What is sawtooth rag */}
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-40">What is sawtooth rag?</p>
				<div className="grid grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
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
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-40">Usage</p>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Drop-in component</p>
						<pre className="bg-white/5 rounded p-4 overflow-x-auto text-xs leading-relaxed font-mono">{`import { RagText } from 'ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>`}</pre>
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook — attach to any element</p>
						<pre className="bg-white/5 rounded p-4 overflow-x-auto text-xs leading-relaxed font-mono">{`import { useRag } from 'ragtooth'

const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })
<p ref={ref}>{children}</p>`}</pre>
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead>
								<tr className="opacity-40 text-left">
									<th className="pb-2 pr-6 font-normal">Option</th>
									<th className="pb-2 pr-6 font-normal">Default</th>
									<th className="pb-2 font-normal">Description</th>
								</tr>
							</thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10">
									<td className="py-2 pr-6 font-mono">sawDepth</td>
									<td className="py-2 pr-6">80</td>
									<td className="py-2">How much shorter the short lines are. Higher = more pronounced sawtooth. Accepts px, %, em, rem.</td>
								</tr>
								<tr className="border-t border-white/10">
									<td className="py-2 pr-6 font-mono">sawPeriod</td>
									<td className="py-2 pr-6">2</td>
									<td className="py-2">Lines per cycle. 2 = every other line short, 3 = two full then one short.</td>
								</tr>
								<tr className="border-t border-white/10">
									<td className="py-2 pr-6 font-mono">maxTracking</td>
									<td className="py-2 pr-6">0.7</td>
									<td className="py-2">Max letter-spacing (px, em, rem). Keeps lines from being stretched into oblivion.</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="w-full max-w-2xl flex justify-between text-xs opacity-30 pt-8 border-t border-white/10">
				<span>ragtooth v{version}</span>
				<a
					href="https://liiift.studio"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:opacity-100 transition-opacity"
				>
					Liiift Studio
				</a>
			</footer>

		</main>
	)
}
