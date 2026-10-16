import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import type { PreprocessorGroup } from 'svelte/compiler';
import { apiReference, type ApiPart } from './api.ts';
import { highlight } from './highlight.ts';
import { MEMBER_LABELS, memberTable } from './members.ts';
import { referencePart } from './reference.ts';

/** Components every page can use without importing them. */
const GLOBAL_COMPONENTS = [
	'Subtitle',
	'CodeBlock',
	'Demo',
	'ApiPart',
	'ReferenceTable',
	'MemberTable',
	'ReleaseTimeline',
	'InstallationBlock'
];

/** Serializes a value into a JS expression that is safe inside Svelte markup. */
const literal = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

const attribute = (attrs: string, name: string) =>
	attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]+)"`))?.[1];

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
 * mdsvex `highlight.highlighter`. A `svelte demo` fence becomes a `<Demo>` that carries its code,
 * which `docsComponents` turns into a component file. Other fences become a `<CodeBlock>`.
 */
export async function highlightCode(
	code: string,
	lang: string | null | undefined,
	meta: string | null | undefined
) {
	const html = await highlight(code, lang ?? 'text');
	const { demo, title } = fenceMeta(meta);
	if (lang === 'svelte' && demo) {
		// base64 keeps the code out of the markdown and Svelte parsers until it is written out.
		return `<Demo source="${Buffer.from(code).toString('base64')}" html={${literal(html)}} />`;
	}
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
	/<p class="MdP"><strong>(Parameters|Return value|Properties|Methods)<\/strong><\/p>(\s*<p class="MdP"><code class="Code MdCode" data-inline(?:="")?>([\s\S]*?)<\/code><\/p>)?/g;

function referenceSections(code: string): string {
	return code.replace(SECTION_LABEL, (_match, label, subtext, type) => {
		const heading = `<h3 class="ReferenceSectionHeading">${label}</h3>`;
		if (!subtext) return heading;
		return `${heading}<p class="ReferenceSectionSubtext"><code><span class="pl-en">${type}</span></code></p>`;
	});
}

/**
 * Runs after mdsvex on `.md` pages. It imports the demos and the docs components a page uses,
 * and fills `<ApiPart name="collapsible" part="Root" />` with the part's props and state.
 */
export function docsComponents({
	routes,
	demos,
	lib
}: {
	routes: string;
	demos: string;
	lib: string;
}): PreprocessorGroup {
	return {
		name: 'docs-components',
		async markup({ content, filename }) {
			if (!filename?.endsWith('.md')) return;
			const imports: string[] = [];
			const dependencies = new Set<string>();
			const references = new Map<string, ApiPart[]>();
			const documented = new Set<string>();

			// Each demo is written to `<section>-<page>-<n>.svelte`, so an error names its page.
			const source = relative(routes, filename).replaceAll(sep, '/');
			const page = source.replace(/\/\+page\.md$/, '').replaceAll('/', '-');
			let demoCount = 0;
			let code = content.replace(/<Demo source="([A-Za-z0-9+/=]*)"/g, (_tag, encoded) => {
				const raw = Buffer.from(encoded, 'base64').toString('utf8');
				const id = `${page}-${++demoCount}`;
				const file = join(demos, `${id}.svelte`);
				mkdirSync(demos, { recursive: true });
				if (!existsSync(file) || readFileSync(file, 'utf8') !== raw) writeFileSync(file, raw);
				const name = `__demo${demoCount}`;
				imports.push(`import ${name} from ${literal(relative(dirname(filename), file))};`);
				return `<Demo id="${id}" page="${source}" component={${name}} raw={${literal(raw)}}`;
			});

			// A commented-out tag is not documentation.
			code = code.replace(/<!--[\s\S]*?-->/g, '');
			// Base UI describes a part in its section only when the page documents several types.
			const multiple =
				(code.match(/<ApiPart\b/g) ?? []).length > 1 || code.search(SECTION_LABEL) !== -1;
			code = await replaceAsync(code, /<ApiPart\b([^>]*?)\s*\/>/g, async (_tag, attrs) => {
				const name = attribute(attrs, 'name');
				const partName = attribute(attrs, 'part');
				if (!name || !partName) throw new Error(`${filename}: <ApiPart> needs name and part`);
				if (!references.has(name)) references.set(name, apiReference(lib, name));
				const parts = references.get(name)!;
				const part = parts.find((candidate) => shortName(candidate.name) === partName);
				if (!part) {
					throw new Error(
						`${filename}: "${name}" has no part "${partName}". Parts: ${parts.map((p) => shortName(p.name)).join(', ')}`
					);
				}
				documented.add(part.name);
				for (const file of part.files) dependencies.add(file);
				const reference = await referencePart(part);
				if (!multiple) reference.description = '';
				return `<ApiPart part={${literal(reference)}} />`;
			});

			if (/<ApiPart\b(?! part=\{)/.test(code)) {
				throw new Error(
					`${filename}: write <ApiPart name="..." part="..." /> as a self-closing tag`
				);
			}
			if (page.startsWith('components-') && !references.size) {
				throw new Error(`${filename}: a component page needs an <ApiPart> for each part`);
			}
			// A page that documents a component documents every part of it.
			for (const [name, parts] of references) {
				const missing = parts.filter((part) => !documented.has(part.name));
				if (missing.length) {
					throw new Error(
						`${filename}: add <ApiPart name="${name}" part="..." /> for ${missing.map((part) => shortName(part.name)).join(', ')}`
					);
				}
			}

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
			return { code: result, dependencies: [...dependencies] };
		}
	};
}

/** `Collapsible.Root` is `Root`. A part without a namespace, such as `Button`, keeps its name. */
export const shortName = (name: string) => name.split('.').pop()!;
