// README visual capture for ragtooth (README Studio harness).
// 1. Bundles the framework-agnostic core (src/core/adjust.ts) into a browser ESM
//    via esbuild — no React, no CDN, fully reproducible offline. The bundle is a
//    regenerable build artifact written under node_modules/ (already gitignored).
// 2. Serves the repo over HTTP and renders scripts/capture.html in headless Chromium.
// 3. Screenshots each `.scene` element to assets/<id>.png with transparent corners.
//
// Run: node scripts/capture.mjs   (from the repo root)
// Setup: playwright is a devDependency; run `npx playwright install chromium` once.

import { createServer } from "node:http"
import { readFile, mkdir } from "node:fs/promises"
import { extname, join } from "node:path"
import { build } from "esbuild"
import { chromium } from "playwright"

const ROOT = process.cwd()

// 1. Bundle the vanilla core into a browser-ready ESM the harness can import directly.
//    Output lands in node_modules/.cache (gitignored) so only the PNG is committed.
await mkdir(join(ROOT, "assets"), { recursive: true })
const CORE_OUT = join(ROOT, "node_modules/.cache/ragtooth-capture/core.mjs")
await mkdir(join(ROOT, "node_modules/.cache/ragtooth-capture"), { recursive: true })
await build({
	entryPoints: [join(ROOT, "src/core/adjust.ts")],
	bundle: true,
	format: "esm",
	outfile: CORE_OUT,
	logLevel: "error",
})
console.log("bundled core ->", CORE_OUT)

const MIME = {
	".html": "text/html",
	".mjs": "application/javascript",
	".js": "application/javascript",
	".css": "text/css",
	".json": "application/json",
	".png": "image/png",
	".svg": "image/svg+xml",
	".woff2": "font/woff2",
	".woff": "font/woff",
}

const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? "/").split("?")[0])
		// Serve the regenerable core bundle from its gitignored cache location.
		const path =
			url === "/_core.mjs"
				? CORE_OUT
				: join(ROOT, url === "/" ? "/scripts/capture.html" : url)
		const data = await readFile(path)
		res.writeHead(200, { "Content-Type": MIME[extname(path)] ?? "application/octet-stream" })
		res.end(data)
	} catch {
		res.writeHead(404)
		res.end("not found")
	}
})

await new Promise((r) => server.listen(0, r))
const { port } = server.address()

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 2 })
await page.goto(`http://localhost:${port}/scripts/capture.html`, { waitUntil: "networkidle" })
await page.evaluate(() => window.__ready ?? document.fonts.ready)
await page.waitForTimeout(600) // let fonts and the rag layout settle

const ids = await page.$$eval(".scene", (els) => els.map((e) => e.id))
for (const id of ids) {
	const el = await page.$(`#${id}`)
	await el.screenshot({ path: `assets/${id}.png`, omitBackground: true })
	console.log("captured assets/%s.png", id)
}

await browser.close()
server.close()
