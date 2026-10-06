// Measures ragtooth against the browser's natural rag in headless Chromium: zig-zag depth, inversions and height cost.
// Bundles the core from src/ (same as capture.mjs), serves it on PORT (default 5965) and prints a table plus a summary.
//
// Run: node scripts/measure.mjs   (from the repo root; needs `npx playwright install chromium` once)

import { createServer } from "node:http"
import { readFile, mkdir } from "node:fs/promises"
import { extname, join } from "node:path"
import { build } from "esbuild"
import { chromium } from "playwright"

/** Repo root (the script is run from it). */
const ROOT = process.cwd()

/** HTTP port for the local server; override with PORT=… to avoid clashes. */
const PORT = Number(process.env.PORT ?? 5965)

/** Fonts under test: the site's Merriweather plus three system faces Chromium has on macOS. */
const FONTS = ["Merriweather", "Georgia", "Arial", "Times New Roman"]

/** Column widths in CSS px. */
const WIDTHS = [300, 420, 560, 720]

/** Option sets measured: the library default and the README's recommended starting point. */
const SETTINGS = [
	{ name: "default (sawDepth 80)", options: {} },
	{ name: "recommended (sawDepth 120)", options: { sawDepth: 120, sawPeriod: 2 } },
]

/** Sample body copy (about 150 words). */
const COPY = "Typography is the craft of endowing human language with a durable visual form. When text is set ragged right, the line endings fall wherever the words happen to break, and the right edge of the column becomes a record of accidents: a notch here, a long peninsula there, two lines of nearly equal length that make the eye wonder whether the setting was meant to be justified. Editorial designers have long preferred a deliberate rhythm instead, alternating long and short lines so that the edge reads as a choice. The difference is small at the level of any single line, but over a page it changes how the paragraph sits on the grid, how the white space on the right is distributed, and how quickly the reader finds the start of the next line. A sawtooth rag makes that rhythm explicit and repeatable, paragraph after paragraph."

await mkdir(join(ROOT, "node_modules/.cache/ragtooth-capture"), { recursive: true })
const CORE_OUT = join(ROOT, "node_modules/.cache/ragtooth-capture/core.mjs")
await build({ entryPoints: [join(ROOT, "src/core/adjust.ts")], bundle: true, format: "esm", outfile: CORE_OUT, logLevel: "error" })

/** MIME types for the static server. */
const MIME = { ".html": "text/html", ".mjs": "application/javascript", ".js": "application/javascript", ".woff2": "font/woff2" }

const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? "/").split("?")[0])
		if (url === "/") {
			res.writeHead(200, { "Content-Type": "text/html" })
			res.end(`<!doctype html><meta charset="utf-8"><style>@font-face{font-family:Merriweather;src:url(/site/public/fonts/Merriweather.woff2) format("woff2");font-display:block}body{margin:0}</style><body></body>`)
			return
		}
		const path = url === "/_core.mjs" ? CORE_OUT : join(ROOT, url)
		const data = await readFile(path)
		res.writeHead(200, { "Content-Type": MIME[extname(path)] ?? "application/octet-stream" })
		res.end(data)
	} catch {
		res.writeHead(404)
		res.end("not found")
	}
})
await new Promise((resolve) => server.listen(PORT, resolve))

const browser = await chromium.launch()
try {
	const page = await browser.newPage()
	await page.goto(`http://localhost:${PORT}/`)
	const rows = await page.evaluate(async ({ FONTS, WIDTHS, SETTINGS, COPY }) => {
		const { applyRag } = await import("/_core.mjs")
		await document.fonts.load('18px "Merriweather"')
		await document.fonts.ready

		/** Right-edge widths of a paragraph's natural lines (word spans grouped by their top). */
		const naturalLines = (p) => {
			const probe = p.cloneNode(false)
			probe.innerHTML = COPY.split(" ").map((w) => `<span>${w}</span>`).join(" ")
			p.after(probe)
			const left = probe.getBoundingClientRect().left
			const lines = new Map()
			for (const s of probe.children) {
				const r = s.getBoundingClientRect()
				const key = Math.round(r.top)
				lines.set(key, Math.max(lines.get(key) ?? 0, r.right - left))
			}
			const height = probe.getBoundingClientRect().height
			probe.remove()
			return { widths: [...lines.values()], height }
		}

		/** Mean absolute difference between consecutive lines, last line excluded. */
		const zigzag = (w) => {
			const body = w.slice(0, -1)
			if (body.length < 2) return 0
			let sum = 0
			for (let i = 1; i < body.length; i++) sum += Math.abs(body[i] - body[i - 1])
			return sum / (body.length - 1)
		}

		const out = []
		for (const font of FONTS) for (const width of WIDTHS) for (const setting of SETTINGS) {
			const p = document.createElement("p")
			p.style.cssText = `font:18px/1.5 "${font}";width:${width}px;margin:0`
			p.textContent = COPY
			document.body.appendChild(p)
			const natural = naturalLines(p)
			applyRag(p, p.innerHTML, setting.options)
			const lines = [...p.querySelectorAll(".rag-line")]
			const widths = lines.map((l) => l.getBoundingClientRect().width)
			// An inversion: a short line (2nd, 4th, … with period 2) at least as long as a long neighbour.
			let inversions = 0
			for (let i = 1; i < widths.length - 1; i += 2) {
				const neighbours = [widths[i - 1], widths[i + 1]].filter((_, k) => k === 0 || i + 1 < widths.length - 1)
				if (neighbours.some((n) => widths[i] >= n)) inversions++
			}
			const overflow = Math.max(0, ...widths.map((w) => w - width))
			out.push({
				font, width, setting: setting.name,
				naturalZig: zigzag(natural.widths), ragZig: zigzag(widths), inversions,
				heightGain: p.getBoundingClientRect().height / natural.height - 1,
				lines: `${natural.widths.length}→${widths.length}`, overflow,
			})
			p.remove()
		}
		return out
	}, { FONTS, WIDTHS, SETTINGS, COPY })

	console.table(rows.map((r) => ({ ...r, naturalZig: r.naturalZig.toFixed(1), ragZig: r.ragZig.toFixed(1), heightGain: `${(r.heightGain * 100).toFixed(1)}%`, overflow: r.overflow.toFixed(1) })))
	for (const setting of SETTINGS) {
		const set = rows.filter((r) => r.setting === setting.name)
		const range = (k) => `${Math.min(...set.map((r) => r[k])).toFixed(1)}–${Math.max(...set.map((r) => r[k])).toFixed(1)}`
		console.log(`${setting.name}: natural zig-zag ${range("naturalZig")} px, ragtooth zig-zag ${range("ragZig")} px, height +${(Math.min(...set.map((r) => r.heightGain)) * 100).toFixed(0)}–${(Math.max(...set.map((r) => r.heightGain)) * 100).toFixed(0)}%, inversions ${set.reduce((a, r) => a + r.inversions, 0)}, max overflow ${Math.max(...set.map((r) => r.overflow)).toFixed(1)} px (${set.length} paragraphs)`)
	}

	// --- Checks quoted in the README (Merriweather 18px/1.5, 560px column, recommended settings) ---
	const checks = await page.evaluate(async ({ COPY }) => {
		const { applyRag } = await import("/_core.mjs")
		const OPTS = { sawDepth: 120, sawPeriod: 2 }

		/** A fresh paragraph of `words` words in the test style. */
		const para = (words) => {
			const all = COPY.split(" ")
			const p = document.createElement("p")
			p.style.cssText = 'font:18px/1.5 "Merriweather";width:560px;margin:0'
			p.textContent = Array.from({ length: words }, (_, i) => all[i % all.length]).join(" ")
			document.body.appendChild(p)
			return p
		}
		/** Widest line minus the column width, px (0 when nothing overflows). */
		const overflow = (p) => Math.max(0, ...[...p.querySelectorAll(".rag-line")].map((l) => l.getBoundingClientRect().width - 560))

		// Apply time: median of 7 runs per paragraph size (the first, warm-up run is dropped).
		const timing = {}
		for (const words of [100, 500, 2000]) {
			const p = para(words)
			const html = p.innerHTML
			const runs = []
			for (let i = 0; i < 8; i++) {
				const t = performance.now()
				applyRag(p, html, OPTS)
				p.getBoundingClientRect() // force the layout the rebuild caused
				runs.push(performance.now() - t)
			}
			runs.shift()
			runs.sort((a, b) => a - b)
			timing[words] = runs[3]
			p.remove()
		}

		// WCAG 1.4.12 text-spacing overrides, as a user stylesheet would apply them (!important).
		const spacing = document.createElement("style")
		spacing.textContent = "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}"
		let p = para(150)
		applyRag(p, p.innerHTML, OPTS)
		document.head.appendChild(spacing)
		const spacingAfter = overflow(p)
		applyRag(p, p.innerHTML, OPTS)
		const spacingRerun = overflow(p)
		spacing.remove()
		p.remove()

		// Text grows (text-only zoom, a font-size change) while the column width stays the same.
		p = para(150)
		applyRag(p, p.innerHTML, OPTS)
		p.style.fontSize = "27px"
		const zoomAfter = overflow(p)
		applyRag(p, p.innerHTML, OPTS)
		const zoomRerun = overflow(p)
		p.remove()

		// Copy-paste: line breaks in the selected text of a ragged paragraph.
		p = para(150)
		applyRag(p, p.innerHTML, OPTS)
		const range = document.createRange()
		range.selectNodeContents(p)
		const sel = getSelection()
		sel.removeAllRanges()
		sel.addRange(range)
		const copied = sel.toString()
		const copy = { lines: p.querySelectorAll(".rag-line").length, newlines: (copied.match(/\n/g) ?? []).length }
		sel.removeAllRanges()
		p.remove()

		return { timing, spacingAfter, spacingRerun, zoomAfter, zoomRerun, copy }
	}, { COPY })
	console.log(`apply time (median of 7, Merriweather 18px, 560px): ${Object.entries(checks.timing).map(([w, ms]) => `${w} words ${ms.toFixed(1)} ms`).join(", ")}`)
	console.log(`WCAG 1.4.12 spacing overrides: overflow ${checks.spacingAfter.toFixed(1)} px until re-run, ${checks.spacingRerun.toFixed(1)} px after applyRag runs again`)
	console.log(`font-size 18→27px at the same width: overflow ${checks.zoomAfter.toFixed(1)} px until re-run, ${checks.zoomRerun.toFixed(1)} px after`)
	console.log(`copy-paste: ${checks.copy.lines} lines, ${checks.copy.newlines} line breaks in the selected text`)

	// --- Layout shift: a server-rendered paragraph (with a block under it) is painted, then ragged ---
	const clsPage = await browser.newPage({ viewport: { width: 800, height: 900 } })
	await clsPage.goto(`http://localhost:${PORT}/`)
	const cls = await clsPage.evaluate(async (copy) => {
		const { applyRag } = await import("/_core.mjs")
		await document.fonts.load('18px "Merriweather"')
		document.body.innerHTML = `<p id="p" style='font:18px/1.5 "Merriweather";width:560px;margin:20px'>${copy}</p><div style="height:300px;margin:20px;background:#ccc"></div>`
		const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
		await frames()
		let total = 0
		new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) total += e.value }).observe({ type: "layout-shift" })
		const p = document.getElementById("p")
		applyRag(p, p.innerHTML, { sawDepth: 120, sawPeriod: 2 })
		await frames()
		await new Promise((r) => setTimeout(r, 200))
		return total
	}, COPY)
	await clsPage.close()
	console.log(`layout shift when a painted 150-word paragraph is ragged (800×900 viewport, 300px block below): CLS ${cls.toFixed(3)}`)

	// --- README snippet checks: the no-build-step paths, served from the local dist/ ---
	const html = await browser.newPage()
	await html.goto(`http://localhost:${PORT}/`)
	const snippets = await html.evaluate(async (copy) => {
		document.body.innerHTML = `<p id="a" style="width:420px">${copy}</p><p id="b" data-ragtooth data-rt-saw-depth="120" style="width:420px">${copy}</p>`
		const { applyRag } = await import("/dist/core.js")
		applyRag(document.getElementById("a"), document.getElementById("a").innerHTML, { sawDepth: 120 })
		await new Promise((resolve) => {
			const s = document.createElement("script")
			s.src = "/dist/ragtooth.webflow.min.js"
			s.onload = resolve
			document.head.appendChild(s)
		})
		await document.fonts.ready
		await new Promise((r) => setTimeout(r, 200))
		const b = document.getElementById("b")
		const lines = b.querySelectorAll(".rag-line").length
		// The embed re-runs when text grows at the same width (its ResizeObserver sees the height change).
		b.style.fontSize = "27px"
		await new Promise((r) => setTimeout(r, 300))
		const zoomOverflow = Math.max(0, ...[...b.querySelectorAll(".rag-line")].map((l) => l.getBoundingClientRect().width - 420))
		return { module: document.querySelectorAll("#a .rag-line").length, embed: lines, zoomOverflow }
	}, COPY)
	console.log(`snippets: dist/core.js module import made ${snippets.module} lines; data-ragtooth embed made ${snippets.embed} lines, and ${snippets.zoomOverflow.toFixed(1)} px overflow after its font size grew 1.5x`)
} finally {
	await browser.close()
	server.close()
}
