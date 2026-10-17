import { relative, sep } from 'node:path';
import type { PreprocessorGroup } from 'svelte/compiler';
import { highlight } from './highlight.ts';
import { MEMBER_LABELS, memberTable } from './members.ts';
import { pageStub } from './types.ts';

/** Components every page can use without importing them. */
const GLOBAL_COMPONENTS = [
	'Subtitle',
	'CodeBlock',
	'ReferenceTable',
	'MemberTable',
	'ReleaseTimeline',
	'InstallationBlock'
];

/** Serializes a value into a JS expression that is safe inside Svelte markup. */
const literal = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

async function replaceAsync(
	input: string,
	pattern: RegExp,
	replace: (...match: string[]) => Promise<string>
) {
	const replacements = await Promise.all(
		[...input.matchAll(pattern)].map((match) => replace(...match))
	);
	let i = 0;
	return input.replace(pattern, () => replacements[i++]);
}

/** A fence's meta, such as `demo` or `title="Anatomy"`. */
export function fenceMeta(meta: string | null | undefined) {
	const text = meta ?? '';
	return {
		demo: /(?:^|\s)demo(?:\s|$)/.test(text),
		title: text.match(/title="([^"]*)"/)?.[1]
	};
}

/**
 * mdsvex `highlight.highlighter`. A fence becomes a `<CodeBlock>`. Demos live in `demos/<name>/`
 * beside the page, so a `svelte demo` fence is a leftover.
 */
export async function highlightCode(
	code: string,
	lang: string | null | undefined,
	meta: string | null | undefined
) {
	const { demo, title } = fenceMeta(meta);
	if (demo) throw new Error('A demo lives in demos/<name>/ beside its page, not in a fence.');
	const html = await highlight(code, lang ?? 'text');
	return `<CodeBlock html={${literal(html)}}${title === undefined ? '' : ` title={${literal(title)}}`} />`;
}

/** Text of an HTML fragment that mdsvex wrote. */
const text = (html: string) =>
	html
		.replace(/<[^>]+>/g, '')
		.replace(/&#123;/g, '{')
		.replace(/&#125;/g, '}')
		.trim();

/** Tables whose first column names one of these become Base UI's reference tables. */
const REFERENCE_TABLES: Record<string, string> = {
	attribute: 'Attribute',
	'css variable': 'CSS Variable'
};

/**
 * A data-attribute or CSS-variable table becomes a `<ReferenceTable>`, and a handle's or function's
 * properties, parameters or methods table a `<MemberTable>`. Any other table gets the frame of Base
 * UI's MDX tables.
 */
function tables(code: string): Promise<string> {
	return replaceAsync(code, /<table>[\s\S]*?<\/table>/g, async (match) => {
		// GFM unescapes `\|` inside a table's code spans. mdsvex does not.
		const table = match.replace(/\\\|/g, '|');
		const cells = (row: string) =>
			[...row.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) => cell[1].trim());
		const [head, ...rows] = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((row) =>
			cells(row[1])
		);
		const first = head ? text(head[0]) : '';
		const members = (MEMBER_LABELS as readonly string[]).includes(first)
			? await memberTable(head, rows, text)
			: undefined;
		if (members) return `<MemberTable table={${literal(members)}} />`;
		const label = REFERENCE_TABLES[first.toLowerCase()];
		if (!label) return mdTable(table);
		return `<ReferenceTable label="${label}" rows={${literal(rows.map(([name, description]) => ({ name: text(name), description })))}} />`;
	});
}

/** Base UI's MDX table: each cell's content sits in a `TableCellInner`, which scrolls when too wide. */
const mdTable = (table: string) =>
	`<div class="TableRoot MdTable">${table
		.replace('<table>', '<table class="TableRootTable">')
		.replace('<thead>', '<thead class="TableHead">')
		.replace('<tbody>', '<tbody class="TableBody">')
		.replace(/<tr>/g, '<tr class="TableRow">')
		.replace(
			/<th\b([^>]*)>([\s\S]*?)<\/th>/g,
			'<th$1 class="TableColumnHeader"><div class="TableCellInner">$2</div></th>'
		)
		.replace(
			/<td\b([^>]*)>([\s\S]*?)<\/td>/g,
			'<td$1 class="TableCell"><div class="TableCellInner">$2</div></td>'
		)}</div>`;

/** Base UI's reference sections: a bold `Return value` paragraph, then optionally the type's name. */
const SECTION_LABEL =
	/<p class="MdP"><strong>(Parameters|Return value|Properties|Methods)<\/strong><\/p>(\s*<p class="MdP"><code class="Code MdCode[^"]*"[^>]*>([\s\S]*?)<\/code><\/p>)?/g;

function referenceSections(code: string): string {
	return code.replace(SECTION_LABEL, (_match, label, subtext, type) => {
		const heading = `<h3 class="ReferenceSectionHeading">${label}</h3>`;
		if (!subtext) return heading;
		return `${heading}<p class="ReferenceSectionSubtext"><code><span class="pl-en">${text(type)}</span></code></p>`;
	});
}

/**
 * Runs after mdsvex on `.md` pages. It imports the docs components a page uses,
 * and checks that the page renders a reference table for each part its `types.ts` documents.
 */
export function docsComponents({
	routes,
	lib
}: {
	routes: string;
	lib: string;
}): PreprocessorGroup {
	return {
		name: 'docs-components',
		async markup({ content, filename }) {
			if (!filename?.endsWith('.md')) return;
			const imports: string[] = [];

			const [section, slug] = relative(routes, filename).split(sep);

			// A commented-out tag is not documentation.
			let code = content.replace(/<!--[\s\S]*?-->/g, '');
			// A page that documents a component documents every part of it.
			const stub = pageStub(filename, lib);
			if (section === 'components' && slug !== '+page.md' && !stub) {
				throw new Error(`${filename}: a component page needs a types.ts beside it`);
			}
			const missing = [...(stub?.tags.keys() ?? [])].filter(
				(tag) => !new RegExp(`<${tag.replace('.', '\\.')}\\s*/>`).test(code)
			);
			if (missing.length)
				throw new Error(`${filename}: add ${missing.map((tag) => `<${tag} />`).join(', ')}`);

			code = (await tables(referenceSections(code))).replace(/<kbd>/g, '<kbd class="Kbd">');

			for (const component of GLOBAL_COMPONENTS) {
				if (new RegExp(`<${component}\\b`).test(code)) {
					imports.push(`import ${component} from '#lib/components/${component}.svelte';`);
				}
			}
			if (!imports.length) return { code };

			const instance = /<script(?![^>]*\bmodule\b)[^>]*>/.exec(code);
			const result = instance
				? `${code.slice(0, instance.index + instance[0].length)}\n${imports.join('\n')}\n${code.slice(instance.index + instance[0].length)}`
				: `<script>\n${imports.join('\n')}\n</script>\n${code}`;
			return { code: result };
		}
	};
}
