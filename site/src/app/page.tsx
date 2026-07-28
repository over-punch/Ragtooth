import Demo from "@/components/Demo"
import Hero from "@/components/Hero"
import CodeBlock from "@/components/CodeBlock"
import { version } from "../../../package.json"
import { version as siteVersion } from "../../package.json"
import SiteFooter from "../components/SiteFooter"
import PortsSection from "../components/PortsSection"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<Hero
				eyebrow="sawtooth rag shaping"
				title={[{ text: "A Sawtooth Rag," }, { text: "on the web.", italic: true, subtle: true }]}
				install="@liiift-studio/ragtooth"
				github="https://github.com/Liiift-Studio/Ragtooth"
				tech={["TypeScript", "Zero dependencies", "React + Vanilla JS", "CJK · Arabic · Thai", "~2.7kb gzipped"]}
			>
				<p className="text-base leading-relaxed max-w-lg">
					Most tools fight your rag. Ragtooth works with it — shaping text into a
					sawtooth pattern of alternating long and short lines. The kind of rhythm that
					reads as design, not accident. A technique from editorial typesetting, now
					in one fully-typed npm package.
				</p>
			</Hero>

			{/* Interactive demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">Live demo — drag the sliders</h2>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "var(--panel)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* What is sawtooth rag */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">What is sawtooth rag?</h2>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed">
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-foreground text-base">The problem with smooth rag</p>
						<p>
							When text is set ragged-right, natural line endings create an
							unpredictable right edge — notches, peninsulas, near-rivers. It can look
							accidental. Most tools patch this with soft hyphens or non-breaking
							spaces: a lot of effort for a result that&rsquo;s still a mess.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold text-foreground text-base">The case for sawtooth rag</p>
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
					<h2 className="text-xs uppercase tracking-[0.18em] font-medium text-muted">Usage</h2>
					<p className="text-xs text-muted tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="text-muted">Drop-in component</p>
						<CodeBlock code={`import { RagText } from '@liiift-studio/ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted">Hook — attach to any element</p>
						<CodeBlock code={`import { useRag } from '@liiift-studio/ragtooth'

const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })
<p ref={ref}>{children}</p>`} />
					</div>
				<div className="flex flex-col gap-3">
					<p className="text-muted">Vanilla JS</p>
					<CodeBlock code={`import { applyRag, removeRag, getCleanHTML } from '@liiift-studio/ragtooth'

const el = document.querySelector('p')
// getCleanHTML strips any previously-injected spans before storing original HTML
const original = getCleanHTML(el)
applyRag(el, original, { sawDepth: 120, sawPeriod: 2 })

// To remove the effect and restore original markup:
removeRag(el, original)`} />
				</div>
					<div className="flex flex-col gap-3">
						<p className="text-muted">Options</p>
						<table className="w-full text-xs">
							<caption className="sr-only">Ragtooth options</caption>
							<thead>
								<tr className="text-subtle text-left">
									<th className="pb-2 pr-6 font-normal">Option</th>
									<th className="pb-2 pr-6 font-normal">Default</th>
									<th className="pb-2 font-normal">Description</th>
								</tr>
							</thead>
							<tbody className="text-muted zebra">
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawDepth</td>
									<td className="py-2 pr-6">80</td>
									<td className="py-2">How much shorter the short lines are, in px. Higher = more pronounced sawtooth. Also accepts %, em, rem, ch as a string.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawPeriod</td>
									<td className="py-2 pr-6">2</td>
									<td className="py-2">Number of lines per cycle. With period 2 the pattern is long–short–long–short. With period 3 it is long–long–short. The short line&apos;s position within the cycle is controlled by sawPhase.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawPhase</td>
									<td className="py-2 pr-6">sawPeriod</td>
									<td className="py-2">Which line within each cycle is shortened (1-indexed). Defaults to the last line of each cycle. Use with sawPeriod to place the short line exactly where you want it.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">sawAlign</td>
									<td className="py-2 pr-6">&apos;top&apos;</td>
									<td className="py-2">Anchor the cycle to the top or bottom of the block. <span className="font-mono">&apos;bottom&apos;</span> with sawPeriod&nbsp;3 keeps the last two lines full — no awkward short penultimate line.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">maxTracking</td>
									<td className="py-2 pr-6">0.7</td>
									<td className="py-2">Max letter-spacing in px (also accepts em, rem). Keeps lines from being stretched into oblivion.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors">
									<td className="py-2 pr-6 font-mono">resize</td>
									<td className="py-2 pr-6">true</td>
									<td className="py-2">Re-runs the algorithm on container resize via ResizeObserver. Set false for static layouts.</td>
								</tr>
								<tr className="hover:bg-foreground/5 transition-colors text-faint">
									<td className="py-2 pr-6 font-mono">ragDifference</td>
									<td className="py-2 pr-6">—</td>
									<td className="py-2">Deprecated alias for sawDepth. Will be removed in a future major version.</td>
								</tr>
							</tbody>
						</table>
					</div>
						<p className="text-xs text-muted leading-relaxed">
							Word boundaries are detected using <span className="font-mono">Intl.Segmenter</span> when available — correctly splitting CJK (Chinese, Japanese, Korean), Arabic, Thai, and other scripts that don&rsquo;t use spaces as word delimiters. Falls back to a whitespace regex in environments without Segmenter support.
						</p>
				</div>
			</section>

			<PortsSection
				npm="@liiift-studio/ragtooth"
				bundle="ragtooth"
				attr="data-ragtooth" figma="partial"
				framerComponent="Ragtooth"
				repo="Liiift-Studio/Ragtooth"
			/>

			<SiteFooter current="ragtooth" npmVersion={version} siteVersion={siteVersion} />

		</main>
	)
}
