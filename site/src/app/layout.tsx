import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Ragtooth — Sawtooth rag for the web",
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
		apple: "/icon.svg",
	},
	description:
		"Ragtooth shapes your text into a sawtooth rag — alternating long and short lines for a rhythm that reads as design, not accident. Works with React, vanilla JS, or any framework. A typographic technique from editorial typesetting, now in one npm package.",
	keywords: [
		"ragtooth",
		"sawtooth rag",
		"typographic rag",
		"rag right",
		"text rag",
		"typography",
		"TypeScript",
		"TypeScript npm package",
		"react typography",
		"react typescript",
		"letter spacing",
		"typesetting",
		"editorial typography",
		"vanilla javascript typography",
		"npm typography",
		"zero dependencies",
	],
	openGraph: {
		title: "Ragtooth — Sawtooth rag for the web",
		description:
			"Shape your text into a sawtooth rag. Works with React, vanilla JS, or any framework. A typographic technique from editorial typesetting, now in one fully-typed npm package.",
		url: "https://ragtooth.liiift.studio",
		siteName: "Ragtooth",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Ragtooth — Sawtooth rag for the web",
		description:
			"Shape your text into a sawtooth rag. Works with React, vanilla JS, or any framework. A typographic technique from editorial typesetting, now in one fully-typed npm package.",
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
