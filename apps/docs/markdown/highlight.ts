import {
	bundledThemes,
	createHighlighter,
	type BundledLanguage,
	type ThemeRegistration
} from 'shiki';

const langs = [
	'svelte',
	'ts',
	'tsx',
	'js',
	'json',
	'jsonc',
	'css',
	'html',
	'bash',
	'diff',
	'text',
	'yaml'
];

/**
 * Base UI colors code with GitHub's prettylights palette, through CSS variables that change with
 * the color scheme. This theme keeps the scopes of Shiki's GitHub theme and swaps each color for
 * the variable of the same role, so one highlight serves light and dark.
 */
const ROLES: Record<string, string> = {
	'#6e7781': 'var(--color-prettylights-syntax-comment)',
	'#cf222e': 'var(--color-prettylights-syntax-keyword)',
	'#0550ae': 'var(--color-prettylights-syntax-constant)',
	'#953800': 'var(--color-prettylights-syntax-variable)',
	'#8250df': 'var(--color-prettylights-syntax-entity)',
	'#116329': 'var(--color-prettylights-syntax-entity-tag)',
	'#0a3069': 'var(--color-prettylights-syntax-string)',
	'#82071e': 'var(--color-prettylights-syntax-brackethighlighter-unmatched)',
	'#57606a': 'var(--color-prettylights-syntax-brackethighlighter-angle)'
};

async function prettylights(): Promise<ThemeRegistration> {
	const github = (await bundledThemes['github-light-default']()).default;
	return {
		name: 'prettylights',
		type: 'light',
		fg: 'var(--color-foreground)',
		bg: 'transparent',
		tokenColors: [
			...(github.tokenColors ?? []).map((rule) => ({
				...rule,
				settings: {
					...rule.settings,
					foreground: rule.settings.foreground
						? (ROLES[rule.settings.foreground.toLowerCase()] ?? 'var(--color-foreground)')
						: undefined,
					background: undefined
				}
			})),
			// Base UI tells components from HTML tags, and names attributes in violet.
			{
				scope: ['support.class.component'],
				settings: { foreground: 'var(--color-docs-infra-syntax-jsx-tag)' }
			},
			{
				scope: ['entity.other.attribute-name'],
				settings: { foreground: 'var(--color-docs-infra-syntax-attr-key)' }
			},
			{
				scope: ['support.type.property-name.css'],
				settings: { foreground: 'var(--color-docs-infra-syntax-css-property)' }
			},
			{
				scope: ['entity.name.type'],
				settings: { foreground: 'var(--color-prettylights-syntax-entity)' }
			},
			{
				scope: ['support.type.builtin', 'constant.language.null', 'constant.language.undefined'],
				settings: { foreground: 'var(--color-docs-infra-syntax-nullish)' }
			}
		]
	};
}

const theme = prettylights();
const highlighter = theme.then((registration) =>
	createHighlighter({ themes: [registration], langs })
);

/** Lines and text the `@highlight` comments mark, with the comments removed from the code. */
type Marked = { code: string; lines: Set<number>; texts: Map<number, string[]> };

// `// @x`, `/* @x */`, `{/* @x */}` and `<!-- @x -->`, alone on a line or after code.
const MARKER =
	/\s*(?:\/\/\s*(@highlight[\w-]*)(.*)$|\{?\/\*\s*(@highlight[\w-]*)(.*?)\*\/\}?|<!--\s*(@highlight[\w-]*)(.*?)-->)\s*$/;

/**
 * Reads Base UI's highlight comments. `@highlight` marks its line, or the next line when it
 * stands alone. `@highlight-start` and `@highlight-end` mark the lines between them.
 * `@highlight-text "a" "b"` marks those strings on its line.
 */
export function readMarkers(source: string): Marked {
	const lines = new Set<number>();
	const texts = new Map<number, string[]>();
	const out: string[] = [];
	let pending: Array<{ kind: string; args: string }> = [];
	let open = false;
	for (const line of source.split('\n')) {
		const match = MARKER.exec(line);
		const kind = match && (match[1] ?? match[3] ?? match[5]);
		const args = match ? (match[2] ?? match[4] ?? match[6] ?? '') : '';
		const rest = match ? line.slice(0, match.index) : line;
		if (kind === '@highlight-start' || kind === '@highlight-end') {
			open = kind === '@highlight-start';
			if (!rest.trim()) continue;
		} else if (kind && !rest.trim()) {
			pending.push({ kind, args });
			continue;
		}
		const index = out.length;
		out.push(match && kind ? rest : line);
		const markers = kind && rest.trim() ? [...pending, { kind, args }] : pending;
		pending = [];
		if (open) lines.add(index);
		for (const marker of markers) {
			if (marker.kind === '@highlight') lines.add(index);
			if (marker.kind === '@highlight-text') {
				texts.set(index, [
					...(texts.get(index) ?? []),
					...[...marker.args.matchAll(/"([^"]+)"/g)].map((quoted) => quoted[1])
				]);
			}
		}
	}
	return { code: out.join('\n'), lines, texts };
}

/**
 * Highlights code into a `<pre>`. Lines marked with `@highlight` comments get `data-hl`, and
 * `@highlight-text` strings are wrapped in `<mark>`.
 */
export async function highlight(source: string, lang = 'text'): Promise<string> {
	const shiki = await highlighter;
	const language = shiki.getLoadedLanguages().includes(lang) ? lang : 'text';
	const { code, lines, texts } = readMarkers(source.replace(/\n$/, ''));
	const rows = code.split('\n');
	const decorations = [...texts].flatMap(([line, strings]) =>
		strings.flatMap((text) =>
			[...rows[line].matchAll(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map(
				(found) => ({
					start: { line, character: found.index },
					end: { line, character: found.index + text.length },
					tagName: 'mark' as const
				})
			)
		)
	);
	return shiki.codeToHtml(code, {
		lang: language,
		theme: 'prettylights',
		decorations,
		transformers: [
			{
				pre(node) {
					delete node.properties.tabindex;
					delete node.properties.style;
					node.properties.class = `shiki language-${language}`;
				},
				line(node, line) {
					if (lines.has(line - 1)) node.properties['data-hl'] = '';
				}
			}
		]
	});
}

const escapeHtml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Highlights a TypeScript type, such as `boolean | 'trap-focus'`, or with `value`, an expression
 * such as a default, into inline spans.
 */
export async function highlightType(code: string, { value = false } = {}): Promise<string> {
	const shiki = await highlighter;
	const prefix = value ? 'const _ = ' : 'type _ = ';
	const lines = shiki.codeToTokensBase(`${prefix}${code}`, { lang: 'ts', theme: await theme });
	let offset = 0;
	let html = '';
	for (const line of lines) {
		for (const token of line) {
			const start = offset;
			offset += token.content.length;
			const content = token.content.slice(Math.max(0, prefix.length - start));
			if (!content) continue;
			html += `<span style="color:${token.color}">${escapeHtml(content)}</span>`;
		}
		offset += 1;
	}
	return html;
}

/** A token of an inline snippet. `color` is unset where the code's own color applies. */
export type InlineToken = { content: string; color?: string; scopes: string[] };

/**
 * Splits a one-line snippet into colored tokens, with the scope names Base UI's
 * `enhanceCodeInline` reads tags from. Returns undefined for a language Shiki has not loaded.
 */
export async function inlineTokens(code: string, lang: string): Promise<InlineToken[] | undefined> {
	const shiki = await highlighter;
	if (!shiki.getLoadedLanguages().includes(lang)) return undefined;
	const lines = shiki.codeToTokensBase(code, {
		lang: lang as BundledLanguage,
		theme: await theme,
		includeExplanation: 'scopeName'
	});
	return lines.flatMap((line, index) => [
		...(index ? [{ content: '\n', scopes: [] }] : []),
		...line.map((token) => ({
			content: token.content,
			color: token.color === 'var(--color-foreground)' ? undefined : token.color,
			scopes: (token.explanation ?? []).flatMap((part) =>
				part.scopes.map((scope) => scope.scopeName)
			)
		}))
	]);
}
