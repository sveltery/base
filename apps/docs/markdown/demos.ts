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

/**
 * The tab name of a file another one imports, as Base UI flattens it: `../../_index.module.css` and
 * `./index.module.css` are `index.module.css`, `../../index.module.css` is `demos.module.css`, and
 * `./button/index.ts` is `button.ts`.
 */
function flatName(file: string, specifier: string) {
	const name = basename(file);
	if (name.startsWith('_index.')) return name.slice(1);
	if (!name.startsWith('index.') || specifier === `./${name}`) return name;
	return `${basename(dirname(file))}${name.slice('index'.length)}`;
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

// The project StackBlitz gets installs Svelte and SvelteKit itself.
const STACKBLITZ_PROVIDES = /^(svelte(\/|$)|\$app\/)/;

type SourceFile = { name: string; path: string; code: string };

/** A variant's entry file and the relative imports it reaches, with each import pointing at its tab name. */
export function readVariant(entry: string) {
	const files: SourceFile[] = [];
	const dependencies: Record<string, string> = {};
	const visit = (path: string, specifier: string, depth: number): string => {
		let name = files.length ? flatName(path, specifier) : basename(path);
		const known = files.find((file) => file.path === path);
		if (known) return known.name;
		const clash = files.find((file) => file.name === name);
		// Base UI keeps the shallower file's name and prefixes the deeper one with its folder.
		if (clash && clash.path.split(sep).length < path.split(sep).length)
			name = `${basename(dirname(path))}/${name}`;
		else if (clash) throw new Error(`${entry}: two files of this demo are both named ${name}`);
		const file = { name, path, code: readFileSync(path, 'utf8') };
		files.push(file);
		const tabs = new Map<string, string>();
		for (const specifier of specifiers(path, file.code)) {
			if (specifier.startsWith('.')) {
				if (depth === MAX_DEPTH)
					throw new Error(`${path}: demo imports go ${MAX_DEPTH} files deep at most`);
				const target = join(dirname(path), specifier);
				if (!existsSync(target)) throw new Error(`${path}: ${specifier} does not exist`);
				tabs.set(specifier, visit(target, specifier, depth + 1));
			} else if (/^[#$]/.test(specifier) && !STACKBLITZ_PROVIDES.test(specifier)) {
				throw new Error(
					`${path}: a demo imports ${specifier}, which a StackBlitz project can't resolve. Import a file beside it.`
				);
			} else if (!STACKBLITZ_PROVIDES.test(specifier)) {
				dependencies[packageName(specifier)] = version(packageName(specifier));
			}
		}
		file.code = file.code.replace(SPECIFIER, (match, keyword, quote, specifier) =>
			tabs.has(specifier) ? `${keyword}${quote}./${tabs.get(specifier)}${quote}` : match
		);
		return name;
	};
	visit(entry, '', 0);
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
