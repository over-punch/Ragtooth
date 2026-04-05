import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Ragtooth — Deliberate saw rag for the web",
	description:
		"A typographic tool that shapes your text into a deliberate sawtooth pattern. npm install ragtooth.",
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
