import fs from 'node:fs';
import path from 'node:path';

const COMPONENT_PROP =
	/(?<![A-Za-z0-9_])Component<\s*(?:import\("([^"]+)"\)\.)?([A-Za-z_][A-Za-z0-9_]*)/g;
const ANONYMOUS_PROP = /Component<\s*\{/;
const EXPORT_DECL = /export\s+(?:interface|type|class|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
const EXPORT_TYPE_LIST = /export\s+type\s*\{([^}]+)\}/g;
const EXPORT_STAR = /export\s+(?:type\s+)?\*\s+from\s+['"]([^'"]+)['"]/g;
const SVELTE_MODULE = /from\s+['"](\.[^'"]+\.svelte)['"]/g;

/**
 * Props type names used by Svelte components in a declaration file.
 * An inline object type is reported as `(anonymous)`.
 *
 * @param {string} source
 * @returns {string[]}
 */
export function componentPropTypeNames(source) {
	/** @type {string[]} */
	const names = [];
	for (const match of source.matchAll(COMPONENT_PROP)) names.push(match[2]);
	if (ANONYMOUS_PROP.test(source)) names.push('(anonymous)');
	return names;
}

/**
 * Names in `source` that are not in `exportedNames`.
 *
 * @param {string} source
 * @param {ReadonlySet<string>} exportedNames
 * @returns {string[]}
 */
export function unexportedComponentProps(source, exportedNames) {
	return componentPropTypeNames(source).filter((name) => !exportedNames.has(name));
}

/**
 * @param {string} source
 * @returns {string[]}
 */
function declaredExports(source) {
	/** @type {string[]} */
	const names = [];
	for (const match of source.matchAll(EXPORT_DECL)) names.push(match[1]);
	for (const match of source.matchAll(EXPORT_TYPE_LIST)) {
		for (const part of match[1].split(',')) {
			const name = part
				.trim()
				.split(/\s+as\s+/)
				.pop();
			if (name) names.push(name);
		}
	}
	return names;
}

/**
 * @param {string} fromFile
 * @param {string} specifier
 */
function resolveDeclaration(fromFile, specifier) {
	const base = path.resolve(path.dirname(fromFile), specifier);
	const candidates = [];
	if (base.endsWith('.js')) candidates.push(`${base.slice(0, -3)}.d.ts`);
	candidates.push(`${base}.d.ts`, base);
	for (const candidate of candidates) {
		if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
	}
	throw new Error(`Cannot resolve ${specifier} from ${fromFile}`);
}

/**
 * Type names exported from a public entry, including `export type *` and `export *`.
 *
 * @param {string} file
 * @param {Set<string>} [seen]
 * @returns {Set<string>}
 */
export function exportedTypeNames(file, seen = new Set()) {
	const abs = path.resolve(file);
	if (seen.has(abs)) return new Set();
	seen.add(abs);
	const source = fs.readFileSync(abs, 'utf8');
	const names = new Set(declaredExports(source));
	for (const match of source.matchAll(EXPORT_STAR)) {
		const target = resolveDeclaration(abs, match[1]);
		for (const name of exportedTypeNames(target, seen)) names.add(name);
	}
	return names;
}

/**
 * Declaration files whose component props must be publicly exported.
 * Includes each package entry and the `.svelte.d.ts` files it re-exports.
 *
 * @param {string} repoRoot
 * @returns {string[]}
 */
export function publicDeclarationFiles(repoRoot) {
	const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
	/** @type {string[]} */
	const files = [];
	for (const value of Object.values(pkg.exports ?? {})) {
		if (typeof value !== 'object' || value == null || !('types' in value)) continue;
		const types = /** @type {{ types?: string }} */ (value).types;
		if (!types) continue;
		const entry = path.join(repoRoot, types);
		files.push(entry);
		const source = fs.readFileSync(entry, 'utf8');
		for (const match of source.matchAll(SVELTE_MODULE)) {
			files.push(resolveDeclaration(entry, `${match[1]}.d.ts`));
		}
	}
	return files;
}

/**
 * Public components whose props type is not exported from the package.
 *
 * @param {string} repoRoot
 * @returns {{ file: string, typeName: string }[]}
 */
export function missingExportedProps(repoRoot) {
	const files = publicDeclarationFiles(repoRoot);
	const exported = new Set();
	for (const file of files) {
		if (!file.endsWith('.d.ts') || file.endsWith('.svelte.d.ts')) continue;
		for (const name of exportedTypeNames(file)) exported.add(name);
	}
	/** @type {{ file: string, typeName: string }[]} */
	const missing = [];
	for (const file of files) {
		const source = fs.readFileSync(file, 'utf8');
		for (const typeName of unexportedComponentProps(source, exported)) {
			missing.push({ file: path.relative(repoRoot, file), typeName });
		}
	}
	return missing;
}

if (process.argv[1]?.endsWith('check-exported-props.mjs')) {
	const repoRoot = path.resolve(path.dirname(import.meta.filename), '..');
	const missing = missingExportedProps(repoRoot);
	if (missing.length > 0) {
		const lines = missing.map((item) => `${item.file}: ${item.typeName}`);
		console.error(
			'Public component props types must be exported. svelte-package skips a consumer .d.ts when ComponentProps points at a type that is not.\n' +
				lines.join('\n')
		);
		process.exit(1);
	}
}
