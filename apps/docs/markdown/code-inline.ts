import { decode, type HastNode } from './headings.ts';
import { inlineTokens, type InlineToken } from './highlight.ts';

const JS_LANGUAGES = new Set(['js', 'jsx', 'ts', 'tsx', 'svelte']);

// mdsvex writes text nodes out as they are, so the code keeps the escapes mdsvex gave it.
const escape = (value: string) =>
	value
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');

const has = (token: InlineToken | undefined, scope: string) =>
	token?.scopes.some((name) => name.startsWith(scope)) ?? false;

/** `enhanceCodeInline`'s wrapper for a tag: `di-ht` for an HTML tag, `di-jt` for a component. */
function tagClass(open: InlineToken, name: InlineToken | undefined) {
	if (!has(open, 'punctuation.definition.tag.begin')) return undefined;
	if (has(name, 'support.class.component')) return 'di-jt';
	if (has(name, 'entity.name.tag')) return 'di-ht';
}

/**
 * The tokens as hast, with each tag from its `<` to its `>` in one wrapper span. `text` escapes
 * each token's content.
 */
export function toHast(tokens: InlineToken[], text = escape): HastNode[] {
	const span = (token: InlineToken): HastNode =>
		token.color
			? {
					type: 'element',
					tagName: 'span',
					properties: { style: `color:${token.color}` },
					children: [{ type: 'text', value: text(token.content) }]
				}
			: { type: 'text', value: text(token.content) };

	const nodes: HastNode[] = [];
	for (let index = 0; index < tokens.length; index++) {
		const wrapper = tagClass(tokens[index], tokens[index + 1]);
		const end = wrapper
			? tokens.findIndex((token, at) => at > index && has(token, 'punctuation.definition.tag.end'))
			: -1;
		if (end === -1) {
			nodes.push(span(tokens[index]));
			continue;
		}
		nodes.push({
			type: 'element',
			tagName: 'span',
			properties: { className: [wrapper] },
			children: tokens.slice(index, end + 1).map(span)
		});
		index = end;
	}
	return nodes;
}

/** Drops `count` characters from the start of the tokens, or from the end with `fromEnd`. */
function trim(tokens: InlineToken[], count: number, fromEnd = false) {
	const list = fromEnd ? [...tokens].reverse() : [...tokens];
	while (count > 0 && list.length) {
		const [first] = list;
		const cut = Math.min(count, first.content.length);
		const content = fromEnd ? first.content.slice(0, -cut) : first.content.slice(cut);
		count -= cut;
		if (content) list[0] = { ...first, content };
		else list.shift();
	}
	return fromEnd ? list.reverse() : list;
}

export async function highlightInline(source: string, lang: string) {
	// A bare object such as `{ height: 400 }` reads as a block of labels, so it is highlighted as an expression.
	const trimmed = source.trim();
	const wrap = JS_LANGUAGES.has(lang) && trimmed.length >= 2 && /^\{[\s\S]*\}$/.test(trimmed);
	const tokens = await inlineTokens(wrap ? `(${source})` : source, lang);
	return tokens && (wrap ? trim(trim(tokens, 1), 1, true) : tokens);
}

const isCode = (node: HastNode) => node.type === 'element' && node.tagName === 'code';

/**
 * Base UI's `transformHtmlCodeInline` and `enhanceCodeInline`. Highlights each code span that
 * has a `language-*` class, marks it `data-inline`, and wraps each tag in it, so `<button>` reads
 * as a tag.
 */
export function codeInline() {
	return async (tree: HastNode) => {
		const spans: HastNode[] = [];
		const visit = (node: HastNode) => {
			if (isCode(node)) spans.push(node);
			else if (node.tagName !== 'pre') node.children?.forEach(visit);
		};
		visit(tree);
		await Promise.all(
			spans.map(async (node) => {
				const properties = node.properties!;
				const lang = /\blanguage-(\S+)/.exec(String(properties.class ?? ''))?.[1];
				const source = decode((node.children ?? []).map((child) => child.value ?? '').join(''));
				const tokens = lang && source && (await highlightInline(source, lang));
				if (!tokens) return;
				node.children = toHast(tokens);
				properties['data-inline'] = '';
			})
		);
	};
}
