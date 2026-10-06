// Core saw-rag algorithm — framework-agnostic, direct DOM mutation
import { RAG_CLASSES, type RagOptions } from './types'
import { resolveValue } from './resolve'

/** Resolved defaults applied when options are omitted */
const DEFAULTS = {
	sawDepth: 80,
	sawPeriod: 2,
	maxTracking: 0.7,
}

/**
 * Block-level element selectors the algorithm targets within the container.
 * Falls back to the container itself if none are found.
 */
const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote'


/** Inline elements kept whole (no text of their own to split). */
const ATOMIC_TAGS = new Set(['IMG', 'SVG', 'INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS', 'IFRAME', 'OBJECT', 'MATH'])

/** Scripts written without spaces between words: segmented into words with Intl.Segmenter. */
const UNSPACED_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u

/** Intl.Segmenter shape we use. */
type SegmenterInstance = { segment: (text: string) => Iterable<{ segment: string; isWordLike?: boolean }> }

/** Warnings already printed. */
const warned = new Set<string>()

/** Prints a console warning the first time it is seen. */
function warnOnce(message: string): void {
	if (warned.has(message)) return
	warned.add(message)
	console.warn(message)
}

/** The snapshot each processed container was built from, returned by getCleanHTML. */
const originals = new WeakMap<HTMLElement, string>()

/**
 * The container's original nodes: every element's child list, so a re-run or removal can put the
 * very same nodes back (keeping their event listeners, React's included) instead of re-parsing HTML.
 */
interface NodeSnapshot { html: string; children: Map<Node, Node[]> }
const snapshots = new WeakMap<HTMLElement, NodeSnapshot>()

/** Records every element's child list under root. */
function takeSnapshot(root: HTMLElement, html: string): NodeSnapshot {
	const children = new Map<Node, Node[]>()
	const visit = (node: Node) => {
		children.set(node, Array.from(node.childNodes))
		node.childNodes.forEach((child) => { if (child.nodeType === Node.ELEMENT_NODE) visit(child) })
	}
	visit(root)
	return { html, children }
}

/** Puts the original nodes back where they were. */
function restoreSnapshot(snapshot: NodeSnapshot): void {
	snapshot.children.forEach((kids, parent) => (parent as Element).replaceChildren(...kids))
}

/** Brings the container back to its original content, reusing the original nodes when known. */
function resetContainer(container: HTMLElement, originalHTML: string): void {
	const snap = snapshots.get(container)
	if (snap && snap.html === originalHTML) {
		restoreSnapshot(snap)
		return
	}
	if (snap) restoreSnapshot(snap)
	const processed = !!container.querySelector(`.${RAG_CLASSES.line}`)
	if (processed || container.innerHTML !== originalHTML) container.innerHTML = originalHTML
	snapshots.set(container, takeSnapshot(container, originalHTML))
}

/**
 * Returns the container's original innerHTML: for a container this library processed, the exact
 * snapshot it was built from; otherwise the innerHTML with any ragtooth markup removed. Idempotent.
 *
 * @param container - Element that may contain rag markup
 */
export function getCleanHTML(container: HTMLElement): string {
	const original = originals.get(container)
	if (original !== undefined && container.querySelector(`.${RAG_CLASSES.line}`)) return original
	const clone = container.cloneNode(true) as HTMLElement
	const ragSpans = clone.querySelectorAll(
		`.${RAG_CLASSES.word}, .${RAG_CLASSES.line}, .${RAG_CLASSES.lineInfo}`,
	)
	ragSpans.forEach((el) => {
		const parent = el.parentNode
		if (!parent) return
		while (el.firstChild) parent.insertBefore(el.firstChild, el)
		parent.removeChild(el)
	})
	clone.querySelectorAll(`br.${RAG_CLASSES.break}`).forEach((br) => br.remove())
	clone.normalize()
	return clone.innerHTML
}

/** One measured unit of a block: a word (or a whole element such as an image). */
interface Unit {
	/** The word span (or atomic element) in the live DOM. */
	node: HTMLElement
	/** Text of the word (empty for an atomic element). */
	text: string
	/** Whitespace before it, kept in the rebuilt text (it collapses at a line start). */
	lead: string
	/** An author <br> right before it: it starts a line. */
	breakBefore: HTMLBRElement | null
	atomic: boolean
	/** Width of the word itself, layout px. */
	width: number
}

/** The transform scale of an element (1 when untransformed): visual width over layout width. */
function layoutScale(el: HTMLElement): number {
	const visual = el.getBoundingClientRect().width
	const layout = el.offsetWidth
	if (!(layout > 0) || !(visual > 0) || Math.abs(visual - layout) <= 1) return 1
	return visual / layout
}

/** A positive finite number, else undefined (with a warning naming the option). */
function finiteOption(value: number, name: string, fallback: number): number {
	if (Number.isFinite(value)) return value
	warnOnce(`[ragtooth] ${name} must resolve to a finite number; using ${fallback}`)
	return fallback
}

/**
 * Applies saw-rag adjustment to a container element.
 *
 * The algorithm runs these passes:
 *  1. Reset — bring the container back to its original content (the original nodes, when known)
 *  2. Word wrap — wrap each word in a measurement span; the spaces between words and elements
 *     stay as text, author <br> and images are kept
 *  3. Measure — read every word's width (layout px)
 *  4. Line grouping — accumulate widths into lines; every sawPeriod-th line is shortened by
 *     sawDepth px. The last two words of each block are kept together (no widow).
 *  5. Write — rebuild each line inside its inline ancestors (one link stays one link within a line),
 *     reusing the original elements so their listeners keep working, and spread the line's slack
 *     as letter-spacing, capped at maxTracking
 *
 * @param container    - The live DOM element to adjust (must be rendered and visible)
 * @param originalHTML - The HTML snapshot taken before the first adjustment run (getCleanHTML)
 * @param options      - Rag options (merged with defaults)
 */
export function applyRag(
	container: HTMLElement,
	originalHTML: string,
	options: RagOptions | null = {},
): void {
	if (typeof window === 'undefined') return
	const opts = options ?? {}
	if (container.offsetWidth === 0) return

	// A snapshot taken from an already-processed container (applyRag(el, el.innerHTML) on a second
	// run) would nest new lines inside the old ones: use the original this container was built from.
	if (originalHTML.includes(RAG_CLASSES.line) && originals.has(container)) {
		originalHTML = originals.get(container)!
	} else if (originalHTML.includes(RAG_CLASSES.line)) {
		const tmp = document.createElement('div')
		tmp.innerHTML = originalHTML
		originalHTML = getCleanHTML(tmp)
	}

	// --- Pass 1: Reset ---
	resetContainer(container, originalHTML)
	originals.set(container, originalHTML)

	const containerWidth = container.clientWidth || container.offsetWidth
	const fontSize = parseFloat(getComputedStyle(container).fontSize) || 16

	// Measure the 'ch' unit — width of the '0' glyph in the container's current font.
	const chProbe = document.createElement('span')
	chProbe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;'
	chProbe.textContent = '0'
	container.appendChild(chProbe)
	const chWidth = chProbe.offsetWidth
	container.removeChild(chProbe)

	// Resolve options — support deprecated ragDifference as fallback for sawDepth.
	if (opts.ragDifference !== undefined && opts.sawDepth === undefined) {
		warnOnce('[ragtooth] ragDifference is deprecated — use sawDepth instead.')
	}
	const sawDepth = Math.max(0, finiteOption(resolveValue(opts.sawDepth ?? opts.ragDifference ?? DEFAULTS.sawDepth, containerWidth, fontSize, chWidth), 'sawDepth', DEFAULTS.sawDepth))
	const rawPeriod = Math.round(Number(opts.sawPeriod ?? DEFAULTS.sawPeriod))
	if (!Number.isFinite(rawPeriod) || rawPeriod < 2 || rawPeriod > 1000) {
		if (opts.sawPeriod !== undefined) warnOnce(`[ragtooth] sawPeriod must be a whole number from 2 to 1000; got ${String(opts.sawPeriod)}, using ${Number.isFinite(rawPeriod) && rawPeriod >= 1 && rawPeriod < 2 ? 2 : DEFAULTS.sawPeriod}`)
	}
	const sawPeriod = Number.isFinite(rawPeriod) && rawPeriod >= 2 && rawPeriod <= 1000 ? rawPeriod : rawPeriod === 1 ? 2 : DEFAULTS.sawPeriod
	const maxTracking = Math.min(fontSize, Math.max(0, finiteOption(resolveValue(opts.maxTracking ?? DEFAULTS.maxTracking, containerWidth, fontSize, chWidth), 'maxTracking', DEFAULTS.maxTracking)))
	const sawAlign = opts.sawAlign ?? 'top'
	// sawPhase: 1-indexed position within the cycle that is shortened (default: the last line).
	const sawPhase = Math.min(sawPeriod, Math.max(1, Math.round(opts.sawPhase ?? sawPeriod)))

	// Blocks to process: the innermost matching blocks (a <p> inside an <li> or <blockquote> is
	// processed itself; its container is not, or the whole <p> would be treated as one word).
	const blocks = Array.from(container.querySelectorAll<HTMLElement>(BLOCK_SELECTOR))
		.filter((block) => !block.querySelector(BLOCK_SELECTOR))
	const targets: HTMLElement[] = blocks.length > 0 ? blocks : [container]

	const SegmenterCtor = typeof Intl !== 'undefined'
		? (Intl as unknown as { Segmenter?: new (locale: undefined, opts: { granularity: string }) => SegmenterInstance }).Segmenter
		: undefined
	const segmenter: SegmenterInstance | null = SegmenterCtor ? new SegmenterCtor(undefined, { granularity: 'word' }) : null

	/** Splits a space-free token into units: words for CJK/Thai (punctuation stays with its word). */
	const splitToken = (token: string): string[] => {
		// A line may break after a hyphen or dash inside a word ("words-|everywhere"); ragtooth sets the
		// breaks itself, so each part is its own unit. Otherwise a long hyphenated run is one unit wider
		// than the line, locked on one line.
		const parts = token.split(/(?<=[\-\u2010\u2013\u2014](?=[^\-\u2010\u2013\u2014]))/u)
		if (parts.length > 1) return parts.flatMap(splitToken)
		if (!segmenter || !UNSPACED_SCRIPT.test(token)) return [token]
		const out: string[] = []
		for (const seg of segmenter.segment(token)) {
			if (seg.isWordLike || out.length === 0) out.push(seg.segment)
			else out[out.length - 1] += seg.segment
		}
		return out
	}

	// --- Pass 2: Word wrap (per block) ---
	const unitsByTarget = new Map<HTMLElement, Unit[]>()
	targets.forEach((block) => {
		const units: Unit[] = []
		let pendingSpace = ''
		let pendingBreak: HTMLBRElement | null = null
		const walk = (node: Node): void => {
			if (node.nodeType === Node.TEXT_NODE) {
				const textNode = node as Text
				const text = textNode.textContent ?? ''
				if (!text.trim()) { pendingSpace += text; return }
				const fragment = document.createDocumentFragment()
				let lead = ''
				for (const token of text.split(/(\s+)/)) {
					if (!token) continue
					if (/^\s+$/.test(token)) {
						fragment.appendChild(document.createTextNode(token))
						lead += token
						continue
					}
					for (const piece of splitToken(token)) {
						const span = document.createElement('span')
						span.className = RAG_CLASSES.word
						span.style.whiteSpace = 'nowrap'
						span.textContent = piece
						fragment.appendChild(span)
						units.push({ node: span, text: piece, lead: pendingSpace + lead, breakBefore: pendingBreak, atomic: false, width: 0 })
						pendingSpace = ''
						pendingBreak = null
						lead = ''
					}
				}
				pendingSpace += lead
				textNode.parentNode!.replaceChild(fragment, textNode)
				return
			}
			if (node.nodeType !== Node.ELEMENT_NODE) return
			const el = node as HTMLElement
			if (el.tagName === 'BR') { pendingBreak = el as unknown as HTMLBRElement; return }
			if (!el.hasChildNodes() || ATOMIC_TAGS.has(el.tagName)) {
				units.push({ node: el, text: '', lead: pendingSpace, breakBefore: pendingBreak, atomic: true, width: 0 })
				pendingSpace = ''
				pendingBreak = null
				return
			}
			Array.from(el.childNodes).forEach(walk)
		}
		Array.from(block.childNodes).forEach(walk)
		unitsByTarget.set(block, units)
	})

	// --- Pass 3: Measure (all reads, before any writes) ---
	const layout = targets.map((block) => {
		const cs = getComputedStyle(block)
		const px = (v: string) => parseFloat(v) || 0
		// Content width in layout px: offsetWidth included padding and border, and a transformed
		// ancestor scales getBoundingClientRect, so word widths are divided by the same scale.
		const scale = layoutScale(block)
		// clientWidth excludes borders; where it isn't available (some test DOMs report 0), use
		// offsetWidth minus borders.
		const boxWidth = block.clientWidth > 0 ? block.clientWidth : block.offsetWidth - px(cs.borderLeftWidth) - px(cs.borderRightWidth)
		const width = boxWidth - px(cs.paddingLeft) - px(cs.paddingRight)
		const indent = px(cs.textIndent)
		const spaceProbe = document.createElement('span')
		spaceProbe.className = RAG_CLASSES.spaceProbe
		spaceProbe.style.whiteSpace = 'pre'
		spaceProbe.textContent = ' '
		block.appendChild(spaceProbe)
		const spaceWidth = spaceProbe.getBoundingClientRect().width / scale
		const units = unitsByTarget.get(block) ?? []
		for (const u of units) u.width = u.node.getBoundingClientRect().width / scale
		block.removeChild(spaceProbe)
		const wrapLong = cs.overflowWrap !== 'normal' || cs.wordBreak === 'break-all' || cs.wordBreak === 'break-word'
		return { block, width, indent, spaceWidth, units, wrapLong }
	})

	// --- Pass 4 + 5: Group into lines and write ---
	for (const { block, width: elementWidth, indent, spaceWidth, units, wrapLong } of layout) {
		if (units.length === 0) continue

		// Widow control: the last two words of the block travel together.
		const glued = new Set<Unit>()
		const lastWords = units.filter((u) => !u.atomic)
		if (lastWords.length >= 2) glued.add(lastWords[lastWords.length - 1])

		/** Width a unit adds to a line: its lead space counts, except at a line start. */
		const addWidth = (u: Unit, lineWidth: number) => u.width + (lineWidth > 0 && /\s/.test(u.lead) ? spaceWidth : 0)

		/** Splits units into lines for a given shortened-line rule. */
		const layOut = (isShort: (lineNo: number) => boolean): Unit[][] => {
			const lines: Unit[][] = [[]]
			let lineWidth = 0
			units.forEach((u, idx) => {
				const lineNo = lines.length
				const ideal = Math.max(1, elementWidth - 1 - (isShort(lineNo) ? sawDepth : 0) - (lineNo === 1 ? indent : 0))
				const w = addWidth(u, lineWidth)
				// A glued last word also carries the word before it to the next line if they don't fit.
				const nextGlued = glued.has(units[idx + 1])
				const gluedExtra = nextGlued ? addWidth(units[idx + 1], 1) : 0
				const startNew = lines[lines.length - 1].length > 0 && (u.breakBefore !== null || (!glued.has(u) && lineWidth + w + gluedExtra > ideal))
				if (startNew) {
					lines.push([])
					lineWidth = 0
				}
				lines[lines.length - 1].push(u)
				lineWidth += addWidth(u, lineWidth)
			})
			return lines
		}

		const shortFromTop = (lineNo: number) => lineNo % sawPeriod === sawPhase % sawPeriod
		let lines = layOut(shortFromTop)
		if (sawAlign === 'bottom') {
			// Count from the last line: iterate until the line count is stable (or oscillates).
			let total = lines.length
			let previous = -1
			for (let iter = 0; iter < 8; iter++) {
				const t = total
				lines = layOut((lineNo) => Math.max(1, t - lineNo + 1) % sawPeriod === sawPhase % sawPeriod)
				if (lines.length === total) break
				if (lines.length === previous) { total = Math.min(lines.length, total); lines = layOut((lineNo) => Math.max(1, total - lineNo + 1) % sawPeriod === sawPhase % sawPeriod); break }
				previous = total
				total = lines.length
			}
		}
		const isShortLine = sawAlign === 'bottom'
			? (lineNo: number) => Math.max(1, lines.length - lineNo + 1) % sawPeriod === sawPhase % sawPeriod
			: shortFromTop

		// Ancestor chains for every unit, read before anything moves.
		const chains = new Map<Unit, Element[]>()
		for (const u of units) {
			const ancestors: Element[] = []
			let node: Element | null = u.node.parentElement
			while (node && node !== block) { ancestors.unshift(node); node = node.parentElement }
			chains.set(u, ancestors)
		}

		const copied = new Set<Element>()
		const fragment = document.createDocumentFragment()
		lines.forEach((line, i) => {
			const lineNo = i + 1
			const ideal = Math.max(1, elementWidth - 1 - (isShortLine(lineNo) ? sawDepth : 0) - (lineNo === 1 ? indent : 0))
			const lineSpan = document.createElement('span')
			lineSpan.className = RAG_CLASSES.line
			lineSpan.style.display = 'inline-block'
			lineSpan.style.whiteSpace = 'nowrap'
			lineSpan.style.verticalAlign = 'top'
			// text-indent is inherited: without this every line would be indented, not just the first.
			lineSpan.style.textIndent = '0'

			let lineWidth = 0
			let openChain: { source: Element; clone: Element }[] = []
			line.forEach((u, k) => {
				lineWidth += addWidth(u, lineWidth)
				const ancestors = chains.get(u) ?? []
				let shared = 0
				while (shared < openChain.length && shared < ancestors.length && openChain[shared].source === ancestors[shared]) shared++
				openChain = openChain.slice(0, shared)
				let parent: Node = shared ? openChain[shared - 1].clone : lineSpan
				let lead = k === 0 ? u.lead.replace(/[\r\n]+/g, '') : u.lead
				// Widow control, as before: the space before the block's last word is non-breaking.
				if (glued.has(u) && /\s/.test(lead)) lead = lead.replace(/\s+$/, '\u00a0')
				if (lead) parent.appendChild(document.createTextNode(lead))
				for (let a = shared; a < ancestors.length; a++) {
					// The first appearance reuses the original element (emptied), so listeners on it
					// keep working; a later line gets a copy without its id.
					let copy: Element
					if (copied.has(ancestors[a])) {
						copy = ancestors[a].cloneNode(false) as Element
						copy.removeAttribute('id')
					} else {
						copy = ancestors[a]
						copy.replaceChildren()
					}
					copied.add(ancestors[a])
					parent.appendChild(copy)
					openChain.push({ source: ancestors[a], clone: copy })
					parent = copy
				}
				if (u.atomic) {
					parent.appendChild(u.node)
				} else {
					// Each word keeps its rag-word span in the output, as before, for anyone styling it.
					const word = document.createElement('span')
					word.className = RAG_CLASSES.word
					word.textContent = u.text
					parent.appendChild(word)
				}
			})

			// A single word wider than the line can't fit a locked line: let it wrap where the author
			// allows breaking inside words, instead of overflowing the block.
			if (line.length === 1 && lineWidth > elementWidth && wrapLong) {
				lineSpan.style.whiteSpace = 'normal'
				lineSpan.style.maxWidth = `${elementWidth}px`
			}

			// Spread the line's slack as letter-spacing (not on the last line), capped at maxTracking.
			// The hidden rag-line-info sentinel records the numbers, as before.
			if (i < lines.length - 1) {
				const charCount = [...line.map((u) => u.text).join('')].length || 1
				const tracking = Math.max(0, Math.min((ideal - 1 - lineWidth) / charCount, maxTracking))
				lineSpan.style.letterSpacing = `${tracking}px`
				const info = document.createElement('span')
				info.className = RAG_CLASSES.lineInfo
				info.style.display = 'none'
				info.setAttribute('aria-hidden', 'true')
				info.setAttribute('data-ideal-width', String(ideal))
				info.setAttribute('data-line-width', String(lineWidth))
				lineSpan.appendChild(info)
			}

			fragment.appendChild(lineSpan)
			if (i < lines.length - 1) {
				const authorBreak = lines[i + 1][0].breakBefore
				if (authorBreak) {
					fragment.appendChild(authorBreak.cloneNode(false))
				} else {
					const br = document.createElement('br')
					br.className = RAG_CLASSES.break
					br.setAttribute('aria-hidden', 'true')
					fragment.appendChild(br)
				}
			}
		})
		block.replaceChildren(fragment)
	}
}

/**
 * Strips all ragtooth injected markup, restoring the container to its original HTML (and its
 * original nodes, when they are known).
 *
 * @param container    - The element that was previously adjusted
 * @param originalHTML - The snapshot passed to the original applyRag call
 */
export function removeRag(container: HTMLElement, originalHTML: string): void {
	const snap = snapshots.get(container)
	if (snap && snap.html === originalHTML) restoreSnapshot(snap)
	else container.innerHTML = originalHTML
	snapshots.delete(container)
	originals.delete(container)
}
