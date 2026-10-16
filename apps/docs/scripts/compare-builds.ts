// Builds the docs at a base ref and in this checkout, then diffs the prerendered output: the URL
// list, every page's <title>, meta description, side nav and <main> HTML, and every non-HTML file.
// Usage, from apps/docs: node scripts/compare-builds.ts [base-ref] [--no-build]
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const docs = new URL('..', import.meta.url).pathname;
const repo = join(docs, '../..');
const args = process.argv.slice(2);
const ref = args.find((arg) => !arg.startsWith('--')) ?? 'origin/main';
const build = !args.includes('--no-build');
const baseTree = join(repo, '../compare-builds-base');

const run = (command: string, cwd: string) => execSync(command, { cwd, stdio: 'inherit' });

if (build) {
	if (!existsSync(baseTree)) run(`git worktree add --detach ${baseTree} ${ref}`, repo);
	run(`git checkout --detach ${ref}`, baseTree);
	for (const root of [baseTree, repo]) {
		run('pnpm install --frozen-lockfile', root);
		run('rm -rf dist && npx svelte-kit sync && npx vite build', join(root, 'apps/docs'));
	}
}

const output = (root: string) => join(root, 'apps/docs/.svelte-kit/output/prerendered');

function files(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? files(path) : [path];
	});
}

const list = (root: string) =>
	new Set(files(output(root)).map((file) => relative(output(root), file)));

const first = (html: string, pattern: RegExp) => pattern.exec(html)?.[1] ?? '(missing)';

// Svelte names scoped classes after the component's file, so a style that moves files gets a new
// hash. Its hydration markers follow the component tree, which a page's wrapper changes.
const normalize = (html: string) =>
	html
		.replace(/svelte-[a-z0-9]{6,}/g, 'svelte-HASH')
		.replace(/<!--(\[-?\d*|\]|)-->/g, '')
		.replace(/>\s+</g, '> <');

function parts(html: string) {
	html = normalize(html);
	return {
		title: first(html, /<title>([\s\S]*?)<\/title>/),
		description: first(html, /<meta name="description" content="([^"]*)"/),
		nav: first(html, /<nav aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/),
		main: first(html, /<main\b[^>]*>([\s\S]*)<\/main>/)
	};
}

// The API tables list props, and union members within a type, in an order that can change between
// two builds of one commit. Splitting on rows and on ` | ` compares them as sets.
const pieces = (value: string) =>
	value
		.split(/<details\b|<\/details>|\n| \\?\| /)
		.sort()
		.join('\n');
const reordered: string[] = [];

const before = list(baseTree);
const after = list(repo);
const differences: string[] = [];
for (const file of before) if (!after.has(file)) differences.push(`removed: ${file}`);
for (const file of after) if (!before.has(file)) differences.push(`added: ${file}`);

for (const file of [...before].filter((name) => after.has(name)).sort()) {
	const a = readFileSync(join(output(baseTree), file), 'utf8');
	const b = readFileSync(join(output(repo), file), 'utf8');
	if (!file.endsWith('.html')) {
		if (a === b) continue;
		if (pieces(a) === pieces(b)) reordered.push(file);
		else differences.push(`changed: ${file}`);
		continue;
	}
	const [pa, pb] = [parts(a), parts(b)];
	for (const key of ['title', 'description', 'nav', 'main'] as const) {
		if (pa[key] === pb[key]) continue;
		if (key === 'main' && pieces(pa.main) === pieces(pb.main)) {
			reordered.push(file);
			continue;
		}
		let at = 0;
		while (pa[key][at] === pb[key][at]) at++;
		differences.push(
			`${file} ${key} differs at ${at}:\n  before: ${pa[key].slice(at - 60, at + 120)}\n  after:  ${pb[key].slice(at - 60, at + 120)}`
		);
	}
}

console.log(
	`${before.size} files before, ${after.size} after. Scoped class hashes and hydration markers ignored.`
);
if (reordered.length)
	console.log(`Same API rows and types in another order: ${reordered.join(', ')}`);
console.log(differences.length ? differences.join('\n') : 'No differences.');
process.exitCode = differences.length ? 1 : 0;
