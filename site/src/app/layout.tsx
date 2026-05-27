import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "Ragtooth — Sawtooth rag for the web",
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
		apple: "/icon.svg",
	},
	description:
		"Sawtooth rag for the web. Shapes text into alternating long and short lines — a rhythm that reads as design, not accident. React, vanilla JS, any framework.",
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
		url: "https://ragtooth.com",
		siteName: "Ragtooth",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Ragtooth — Sawtooth rag for the web",
		description:
			"Shape your text into a sawtooth rag. Works with React, vanilla JS, or any framework. A typographic technique from editorial typesetting, now in one fully-typed npm package.",
	},
	metadataBase: new URL("https://ragtooth.com"),
	alternates: { canonical: "https://ragtooth.com" },
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
