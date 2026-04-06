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
						Deliberate saw rag<br />for the web.
					</h1>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					Most tools try to smooth your rag. Ragtooth does the opposite — it shapes your
					text into a deliberate sawtooth pattern, alternating long and short lines.
					A typographic technique from editorial and book design, now available for React.
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
				<p className="text-xs uppercase tracking-widest opacity-40">Live demo</p>
				<Demo />
			</section>

			{/* What is saw rag */}
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-40">What is saw rag?</p>
				<div className="grid grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">The problem with smooth rag</p>
						<p>
							When text is set ragged-right, the natural line endings create an unpredictable,
							sometimes ugly right edge — notches, peninsulas, near-rivers. Most tools
							try to correct this by inserting soft hyphens or non-breaking spaces.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">The case for saw rag</p>
						<p>
							A deliberate sawtooth pattern — long line, short line, long line — gives
							the rag a rhythm. It is intentional rather than accidental, structured
							rather than random. The eye reads it as design, not error.
						</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-40">Usage</p>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Component</p>
						<pre className="bg-white/5 rounded p-4 overflow-x-auto text-xs leading-relaxed font-mono">{`import { RagText } from 'ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Lorem ipsum dolor sit amet...
</RagText>`}</pre>
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook</p>
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
									<td className="py-2">Pixels shorter the short lines are. Higher = more pronounced saw.</td>
								</tr>
								<tr className="border-t border-white/10">
									<td className="py-2 pr-6 font-mono">sawPeriod</td>
									<td className="py-2 pr-6">2</td>
									<td className="py-2">Lines per cycle. 2 = every other short, 3 = two full then one short.</td>
								</tr>
								<tr className="border-t border-white/10">
									<td className="py-2 pr-6 font-mono">maxTracking</td>
									<td className="py-2 pr-6">0.7</td>
									<td className="py-2">Max letter-spacing in px. Prevents short lines being over-stretched.</td>
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
