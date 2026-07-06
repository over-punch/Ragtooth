// vite.webflow.config.ts — standalone minified IIFE bundle for Webflow Custom Code Embed.
// Produces a single self-contained browser global (window.Ragtooth) with no module loader,
// no React, and no external dependencies — droppable into a Webflow embed via one <script> tag.
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		// Do not wipe dist/ — the library build (vite.config.ts) writes index.js/.cjs there too.
		emptyOutDir: false,
		lib: {
			entry: 'src/webflow/embed.ts',
			formats: ['iife'],
			// Exposes the module's exports (init, refit, destroy) as window.Ragtooth.
			name: 'Ragtooth',
			fileName: () => 'ragtooth.webflow.min.js',
		},
		// ragtooth's core has zero runtime dependencies and no dynamic import() — nothing
		// to externalise, so the bundle is fully self-contained.
		minify: true,
	},
})
