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
			rollupTypes: true,
		}),
	],
	test: {
		environment: 'happy-dom',
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'RagRub',
			formats: ['es', 'cjs'],
			fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
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
