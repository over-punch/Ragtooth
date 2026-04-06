import type { Metadata } from "next"
import { Merriweather } from "next/font/google"
import "./globals.css"

const merriweather = Merriweather({
	subsets: ["latin"],
	weight: ["300", "400", "700"],
	style: ["normal", "italic"],
	display: "swap",
	variable: "--font-merriweather",
})

export const metadata: Metadata = {
	title: "Ragtooth — Sawtooth rag for React",
	description:
		"Ragtooth is a React library that shapes your text into a sawtooth rag — alternating long and short lines for a rhythm that reads as design, not accident. A typographic technique from editorial typesetting, now in one npm package.",
	keywords: [
		"ragtooth",
		"sawtooth rag",
		"typographic rag",
		"rag right",
		"text rag",
		"typography React",
		"letter spacing",
		"typesetting",
		"editorial typography",
		"React typography",
		"npm typography",
	],
	openGraph: {
		title: "Ragtooth — Sawtooth rag for React",
		description:
			"Shape your text into a sawtooth rag. A typographic technique from editorial typesetting, now in one npm package.",
		url: "https://ragtooth.liiift.studio",
		siteName: "Ragtooth",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Ragtooth — Sawtooth rag for React",
		description:
			"Shape your text into a sawtooth rag pattern. A typographic technique from editorial typesetting, now in one npm package.",
	},
	metadataBase: new URL("https://ragtooth.liiift.studio"),
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={`h-full antialiased ${merriweather.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
