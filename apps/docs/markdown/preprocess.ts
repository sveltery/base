import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import type { PreprocessorGroup } from 'svelte/compiler';
import { apiReference, type ApiPart } from './api.ts';
import { highlight } from './highlight.ts';

/** Components every page can use without importing them. */
const GLOBAL_COMPONENTS = ['CodeBlock', 'Demo', 'ApiPart', 'Callout'];

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
	if (lang === 'svelte' && (meta ?? '').split(/\s+/).includes('demo')) {
		// base64 keeps the code out of the markdown and Svelte parsers until it is written out.
		return `<Demo source="${Buffer.from(code).toString('base64')}" html={${literal(html)}} />`;
	}
	return `<CodeBlock html={${literal(html)}} raw={${literal(code)}} />`;
}

/**
 * Runs after mdsvex on `.md` pages. It imports the demos and the docs components a page uses,
 * and fills `<ApiPart name="collapsible" part="Root" />` with the part's props and state.
 */
export function docsComponents({
	pages,
	demos,
	lib
}: {
	pages: string;
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
			const page = relative(pages, filename).replace(/\.md$/, '').replaceAll(sep, '-');
			let demoCount = 0;
			let code = content.replace(/<Demo source="([A-Za-z0-9+/=]*)"/g, (_tag, source) => {
				const raw = Buffer.from(source, 'base64').toString('utf8');
				const id = `${page}-${++demoCount}`;
				const file = join(demos, `${id}.svelte`);
				mkdirSync(demos, { recursive: true });
				if (!existsSync(file) || readFileSync(file, 'utf8') !== raw) writeFileSync(file, raw);
				const name = `__demo${demoCount}`;
				imports.push(`import ${name} from ${literal(relative(dirname(filename), file))};`);
				return `<Demo id="${id}" component={${name}} raw={${literal(raw)}}`;
			});

			// A commented-out tag is not documentation.
			code = code.replace(/<!--[\s\S]*?-->/g, '');
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
				return `<ApiPart part={${literal(part)}} />`;
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
