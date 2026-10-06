/// <reference types="vitest" />
// Vite library-mode build — outputs ESM and CJS bundles with types via vite-plugin-dts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ['src'],
			// Tests and the Framer component aren't part of the package (they shipped as empty .d.ts files).
			exclude: ['src/__tests__/**', 'src/framer/**', 'src/webflow/**'],
			rollupTypes: true,
		}),
	],
	test: {
		environment: 'happy-dom',
	},
	build: {
		lib: {
			// index: everything, including the React hook and component (imports react).
			// core: the vanilla API only, for apps without React and for SSR.
			entry: { index: resolve(__dirname, 'src/index.ts'), core: resolve(__dirname, 'src/core.ts') },
			name: 'Ragtooth',
			formats: ['es', 'cjs'],
			fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
		},
		rollupOptions: {
			external: ['react', 'react/jsx-runtime', 'react-dom'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
		},
	},
})
