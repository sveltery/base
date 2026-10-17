import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import docs from '../package.json' with { type: 'json' };
import { highlight, readMarkers } from './highlight.ts';

/** One file of a demo variant: its tab name, its code without highlight markers, and that code highlighted. */
export type DemoFile = { name: string; code: string; html: string };

/** A styling variant of a demo, such as `Tailwind`. */
export type DemoVariant = {
	/** The entry file first, then the files it imports, each under its tab name. */
	files: DemoFile[];
	/** The npm packages the files import, at the version the docs use. */
	dependencies: Record<string, string>;
	/** The variant's folder, from the repository root. */
	path: string;
};

/** What the `docs-demos` plugin passes each `createDemoWithVariants` call. */
export type DemoPrecompute = { slug: string; variants: Record<string, DemoVariant> };

const CALL = /\bcreateDemoWithVariants\(\s*import\.meta\.url,\s*\{([^}]*)\}\s*\)/;
// Base UI's loader follows relative imports this deep (`processRelativeImports`).
const MAX_DEPTH = 5;
const SPECIFIER = /(\b(?:from|import)\s*)(['"])([^'"]+)\2/g;
const LANGUAGES: Record<string, string> = {
	'.svelte': 'svelte',
	'.ts': 'ts',
	'.js': 'js',
	'.css': 'css',
	'.json': 'json'
};

/** The tab name of a file another one imports, as Base UI flattens it: `_index.css` is `index.css`, `button/index.ts` is `button.ts`. */
function flatName(file: string) {
	const name = basename(file).replace(/^_index\./, 'index.');
	return name.startsWith('index.') ? `${basename(dirname(file))}${extname(file)}` : name;
}

/** The import specifiers of a file. A Svelte component's markup is not read, only its scripts. */
function specifiers(file: string, code: string) {
	const scripts = file.endsWith('.svelte')
		? [...code.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n')
		: code;
	return [...scripts.matchAll(SPECIFIER)].map((match) => match[3]);
}

const packageName = (specifier: string) =>
	specifier
		.split('/')
		.slice(0, specifier.startsWith('@') ? 2 : 1)
		.join('/');

const versions: Record<string, string> = { ...docs.dependencies, ...docs.devDependencies };
const version = (name: string) =>
	versions[name]?.startsWith('workspace:') ? 'latest' : (versions[name] ?? 'latest');

const repo = fileURLToPath(new URL('../../..', import.meta.url));

type SourceFile = { name: string; path: string; code: string };

/** A variant's entry file and the relative imports it reaches, with each import pointing at its tab name. */
export function readVariant(entry: string): {
	files: SourceFile[];
	dependencies: Record<string, string>;
	path: string;
} {
	const files: SourceFile[] = [];
	const dependencies: Record<string, string> = {};
	const visit = (path: string, depth: number): string => {
		const name = files.length ? flatName(path) : basename(path);
		const known = files.find((file) => file.path === path);
		if (known) return known.name;
		if (files.some((file) => file.name === name))
			throw new Error(`${entry}: two files of this demo are both named ${name}`);
		const file = { name, path, code: readFileSync(path, 'utf8') };
		files.push(file);
		for (const specifier of specifiers(path, file.code)) {
			if (specifier.startsWith('.')) {
				if (depth === MAX_DEPTH)
					throw new Error(`${path}: demo imports go ${MAX_DEPTH} files deep at most`);
				const target = join(dirname(path), specifier);
				if (!existsSync(target)) throw new Error(`${path}: ${specifier} does not exist`);
				const tab = visit(target, depth + 1);
				file.code = file.code.replace(
					new RegExp(`(['"])${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`),
					`$1./${tab}$1`
				);
			} else if (/^[#$]/.test(specifier) && !specifier.startsWith('$app/')) {
				throw new Error(
					`${path}: a demo imports ${specifier}, which a StackBlitz project can't resolve. Import a file beside it.`
				);
			} else if (
				specifier !== 'svelte' &&
				!specifier.startsWith('svelte/') &&
				!specifier.startsWith('$app/')
			) {
				dependencies[packageName(specifier)] = version(packageName(specifier));
			}
		}
		return name;
	};
	visit(entry, 0);
	return { files, dependencies, path: relative(repo, dirname(entry)).replaceAll(sep, '/') };
}

/**
 * The variants a `demos/<name>/index.ts` stub names, as Base UI writes it:
 *
 *   export const DemoAccordionHero = createDemoWithVariants(import.meta.url, { Tailwind });
 */
export function readDemo(stub: string, code = readFileSync(stub, 'utf8')) {
	const call = CALL.exec(code);
	if (!call) throw new Error(`${stub}: no createDemoWithVariants(import.meta.url, { ... }) call`);
	const imports = new Map(
		[...code.matchAll(/^import (\w+) from '(\.[^']+)';$/gm)].map((match) => [match[1], match[2]])
	);
	const variants = call[1]
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean)
		.map((name) => {
			const entry = imports.get(name);
			if (!entry) throw new Error(`${stub}: import ${name} from './<variant>/index.svelte'`);
			return [name, readVariant(join(dirname(stub), entry))] as const;
		});
	return { slug: basename(dirname(stub)), variants, callEnd: call.index + call[0].length - 1 };
}

/**
 * The demos a page renders, such as `<DemoAccordionHero />`, from the stubs its script imports:
 * each tag and the files of its first variant, with highlight markers removed.
 */
export function pageDemos(page: string, source: string) {
	const demos = new Map<string, SourceFile[]>();
	for (const [, name, path] of source.matchAll(/import \{ (Demo\w+) \} from '(\.[^']+)';/g)) {
		const [[, variant]] = readDemo(join(dirname(page), path, 'index.ts')).variants;
		demos.set(
			name,
			variant.files.map((file) => ({ ...file, code: readMarkers(file.code).code }))
		);
	}
	return demos;
}

/** A file's code with its highlight markers removed, as the copy button and StackBlitz receive it. */
const demoFile = async ({ name, code }: SourceFile): Promise<DemoFile> => ({
	name,
	code: readMarkers(code).code,
	html: await highlight(code, LANGUAGES[extname(name)] ?? 'text')
});

/**
 * Fills each `demos/<name>/index.ts` with its variants' files, highlighted, as Base UI's
 * `loadPrecomputedCodeHighlighter` loader does.
 */
export function docsDemos({ routes }: { routes: string }): Plugin {
	return {
		name: 'docs-demos',
		// Before TypeScript is stripped, so the stub reads as written.
		enforce: 'pre',
		async transform(code, id) {
			if (!id.startsWith(routes) || !/\/demos\/[^/]+\/index\.ts$/.test(id)) return;
			const demo = readDemo(id, code);
			const precompute: DemoPrecompute = { slug: demo.slug, variants: {} };
			for (const [name, variant] of demo.variants) {
				for (const file of variant.files) this.addWatchFile(file.path);
				precompute.variants[name] = {
					files: await Promise.all(variant.files.map(demoFile)),
					dependencies: variant.dependencies,
					path: variant.path
				};
			}
			return `${code.slice(0, demo.callEnd)}, ${JSON.stringify(precompute)}${code.slice(demo.callEnd)}`;
		}
	};
}
