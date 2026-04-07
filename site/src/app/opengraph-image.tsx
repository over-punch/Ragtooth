// OG image for ragtooth.liiift.studio — generated at build time via next/og
// Satori (used by ImageResponse) supports TTF and WOFF but not WOFF2.
import { ImageResponse } from 'next/og'

export const alt = 'Ragtooth — Sawtooth rag for the web'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
	// Inter Light 300 as WOFF — Satori supports WOFF/TTF, not WOFF2
	const interLight = await fetch(
		'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-300-normal.woff',
	).then((res) => res.arrayBuffer())

	return new ImageResponse(
		(
			<div
				style={{
					background: '#0c0c0c',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '72px 80px',
					fontFamily: 'Inter, sans-serif',
				}}
			>
				{/* Label */}
				<span style={{ fontSize: 13, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
					ragtooth
				</span>

				{/* Sawtooth preview + headline */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
						{[1, 0.58, 1, 0.58, 1].map((scale, i) => (
							<div
								key={i}
								style={{
									width: `${scale * 600}px`,
									height: 3,
									background: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
									borderRadius: 2,
								}}
							/>
						))}
					</div>
					<div style={{ fontSize: 76, color: '#ffffff', lineHeight: 1.06, fontWeight: 300 }}>
						A Sawtooth Rag,
					</div>
					<div style={{ fontSize: 76, color: 'rgba(255,255,255,0.4)', lineHeight: 1.06, fontWeight: 300 }}>
						on the web.
					</div>
				</div>

				{/* Footer */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
					<div style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', display: 'flex', gap: 20 }}>
						<span>TypeScript</span>
						<span style={{ opacity: 0.4 }}>·</span>
						<span>Zero dependencies</span>
						<span style={{ opacity: 0.4 }}>·</span>
						<span>React + Vanilla JS</span>
						<span style={{ opacity: 0.4 }}>·</span>
						<span>~2.7kb gzipped</span>
					</div>
					<div style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
						ragtooth.liiift.studio
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [{ name: 'Inter', data: interLight, style: 'normal', weight: 300 }],
		},
	)
}
