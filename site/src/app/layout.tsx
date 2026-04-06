import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Ragtooth — Deliberate sawtooth rag for React",
	description:
		"Ragtooth is a React library that gives your text a deliberate sawtooth rag — alternating long and short lines for a rhythm that feels designed, not accidental. A typographic technique from editorial and book design, now in one npm package.",
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
		title: "Ragtooth — Deliberate sawtooth rag for React",
		description:
			"Shape your text into a deliberate sawtooth pattern. A typographic technique from editorial and book design, now in one npm package.",
		url: "https://ragtooth.liiift.studio",
		siteName: "Ragtooth",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Ragtooth — Deliberate sawtooth rag for React",
		description:
			"Shape your text into a deliberate sawtooth pattern. A typographic technique from editorial and book design, now in one npm package.",
	},
	metadataBase: new URL("https://ragtooth.liiift.studio"),
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
