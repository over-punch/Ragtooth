// Syntax-highlighted code block using sugar-high (server component)
import { highlight } from 'sugar-high'

/** Renders a highlighted TSX/JS code snippet */
export default function CodeBlock({ code }: { code: string }) {
	const highlighted = highlight(code)
	return (
		<pre className="bg-white/5 rounded p-4 overflow-x-auto text-xs leading-relaxed">
			<code dangerouslySetInnerHTML={{ __html: highlighted }} />
		</pre>
	)
}
