import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';
import { apiFolder, sortTypes, type ApiExternal, type ApiPart, type ApiType } from './api.ts';
import { highlight } from './highlight.ts';
import { referencePart, type ReferenceType } from './reference.ts';
import { prettyCode, typesMarkdown } from './types-markdown.ts';

/**
 * A page's `types.ts`, as Base UI writes it:
 *
 *   const { types } = createMultipleTypes(import.meta.url, Accordion);
 *   export const TypesAccordion = types;
 */
export type TypesStub = {
	/** `createTypes` documents one part, `createMultipleTypes` several, each with its description. */
	multiple: boolean;
	parts: ApiPart[];
	/** The entries' exported types no part documents, for Additional Types. */
	types: ApiType[];
	externals: ApiExternal[];
	/** Each tag the page writes, such as `TypesAccordion.Root`, and the part it renders. */
	tags: Map<string, ApiPart>;
	/** The tag that renders `AdditionalTypes`, such as `TypesAvatarAdditional`. */
	additional?: string;
	/** Where the factory call's closing parenthesis is, so the precompute can go before it. */
	callEnd: number;
};

const CALL = /\b(createTypes|createMultipleTypes)\(import\.meta\.url,\s*(\{[^}]*\}|\w+)\s*\)/;

/** Reads a `types.ts` stub and the parts of the library entries it names. */
export function readStub(file: string, lib: string, code = readFileSync(file, 'utf8')): TypesStub {
	const call = CALL.exec(code);
	if (!call) throw new Error(`${file}: no createTypes(import.meta.url, ...) call`);
	const folders = new Map(
		[...code.matchAll(/import \{ (\w+) \} from '@sveltery\/base\/([\w-]+)';/g)].map((match) => [
			match[1],
			match[2]
		])
	);
	const names = call[2]
		.replace(/[{}]/g, '')
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
	const read = names.map((name) => {
		const folder = folders.get(name);
		if (!folder) throw new Error(`${file}: import ${name} from '@sveltery/base/<folder>'`);
		return { name, ...apiFolder(lib, folder) };
	});
	const parts = read.flatMap(({ name, parts }) =>
		parts.filter((part) => part.name === name || part.name.startsWith(`${name}.`))
	);
	const unique = <T extends { name: string }>(items: T[]) => [
		...new Map(items.map((item) => [item.name, item])).values()
	];
	const multiple = call[1] === 'createMultipleTypes';
	if (!multiple && parts.length !== 1) {
		throw new Error(`${file}: createTypes documents one part. Use createMultipleTypes.`);
	}
	const tags = new Map<string, ApiPart>();
	let additional: string | undefined;
	for (const [, name, member, additionalTypes] of code.matchAll(
		/export const (\w+) = (?:types(?:\.(\w+))?|create|(AdditionalTypes))/g
	)) {
		if (additionalTypes) additional = name;
		else if (!multiple) tags.set(name, parts[0]);
		else if (member) tags.set(name, partNamed(parts, member, file));
		else for (const part of parts) tags.set(`${name}.${shortName(part.name)}`, part);
	}
	return {
		multiple,
		parts,
		types: sortTypes(unique(read.flatMap(({ types }) => types))),
		externals: unique(read.flatMap(({ externals }) => externals)),
		tags,
		additional,
		callEnd: call.index + call[0].length - 1
	};
}

const partNamed = (parts: ApiPart[], short: string, file: string) => {
	const part = parts.find((candidate) => shortName(candidate.name) === short);
	if (!part) throw new Error(`${file}: no part ${short}`);
	return part;
};

/** `Collapsible.Root` is `Root`. A part without a namespace, such as `Button`, keeps its name. */
export const shortName = (name: string) => name.split('.').pop()!;

/** The `types.ts` beside a page, if the page documents an API. */
export const pageStub = (page: string, lib: string) => {
	const file = join(dirname(page), 'types.ts');
	return existsSync(file) ? readStub(file, lib) : undefined;
};

/**
 * Writes `types.md` beside a `types.ts` when it changed, as Base UI's `syncTypes` does.
 * Returns whether it wrote.
 */
export async function syncTypes(file: string, stub: TypesStub, routes: string): Promise<boolean> {
	const target = join(dirname(file), 'types.md');
	const route = relative(dirname(routes), dirname(file)).replaceAll(sep, '/');
	const markdown = await typesMarkdown(route, stub, target);
	if (existsSync(target) && readFileSync(target, 'utf8') === markdown) return false;
	writeFileSync(target, markdown);
	return true;
}

const referenceType = async (type: ApiType): Promise<ReferenceType> => ({
	name: type.name,
	slug: type.name.toLowerCase(),
	code: await highlight(await prettyCode(type.code), 'ts')
});

/**
 * Fills each page's `types.ts` with its parts' reference tables, as Base UI's
 * `loadPrecomputedTypes` loader does, and keeps the `types.md` beside it current.
 */
export function docsTypes({ routes, lib }: { routes: string; lib: string }): Plugin {
	return {
		name: 'docs-types',
		// Before TypeScript is stripped, so the stub reads as written.
		enforce: 'pre',
		async transform(code, id) {
			if (!id.startsWith(routes) || !id.endsWith('/types.ts')) return;
			const stub = readStub(id, lib, code);
			for (const file of new Set(stub.parts.flatMap((part) => part.files))) {
				this.addWatchFile(file);
			}
			await syncTypes(id, stub, routes);
			const precompute = {
				parts: await Promise.all(stub.parts.map(referencePart)),
				additionalTypes: stub.additional ? await Promise.all(stub.types.map(referenceType)) : []
			};
			return `${code.slice(0, stub.callEnd)}, ${JSON.stringify(precompute)}${code.slice(stub.callEnd)}`;
		}
	};
}
