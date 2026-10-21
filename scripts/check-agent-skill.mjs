// Checks skills/sveltery-base against the library and the docs:
// frontmatter, relative links, docs URLs, data attributes, CSS variables,
// change reasons, named type exports, and every Svelte example that is not
// marked **Incorrect:** (compiled with svelte-check inside the docs app).
// Usage: node scripts/check-agent-skill.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(new URL(import.meta.url).pathname), '..');
const skillDir = join(root, 'skills/sveltery-base');
const lib = join(root, 'src/lib');
const docsRoutes = join(root, 'apps/docs/src/routes/(docs)');
const errors = [];
const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
	);
const skillFiles = walk(skillDir).filter((file) => file.endsWith('.md'));
const libSource = walk(lib)
	.filter((file) => /\.(ts|svelte)$/.test(file) && !/\.(spec|test)\./.test(file))
	.map((file) => readFileSync(file, 'utf8'))
	.join('\n');

// Frontmatter.
const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? '';
if (!/^name: sveltery-base$/m.test(frontmatter))
	fail(skillDir, 'frontmatter name is not sveltery-base');
const description = /^description: (.+)$/m.exec(frontmatter)?.[1] ?? '';
if (!description || description.length > 1024 || /[<>]/.test(description))
	fail(skillDir, 'description is missing, over 1024 characters, or has angle brackets');

const exportedTypes = new Set(
	[...libSource.matchAll(/export (?:interface|type|const|class|function) (\w+)/g)].map((m) => m[1])
);
for (const [, names] of libSource.matchAll(/export type \{([^}]+)\}/g))
	for (const name of names.split(','))
		exportedTypes.add(
			name
				.trim()
				.split(/\s+as\s+/)
				.pop()
		);
const evals = JSON.parse(readFileSync(join(skillDir, 'evals/evals.json'), 'utf8'));
if (evals.skill_name !== 'sveltery-base' || !evals.evals.length)
	fail(skillDir, 'evals.json is empty or misnamed');

for (const file of skillFiles) {
	const text = readFileSync(file, 'utf8');

	for (const [, href] of text.matchAll(/\]\((\.{1,2}\/[^)#]+)/g))
		if (!existsSync(join(dirname(file), href))) fail(file, `broken link ${href}`);

	for (const [, path] of text.matchAll(/https:\/\/base\.sveltery\.dev(\/[\w/.-]*)/g)) {
		if (['/llms.txt', '/llms-full.txt', '/index.md'].includes(path)) continue;
		const page = path.replace(/\.md$/, '').replace(/<\w+>/, '');
		if (path.includes('<')) continue;
		if (!existsSync(join(docsRoutes, page, '+page.md'))) fail(file, `no docs route for ${path}`);
	}
	for (const [, section, name] of text.matchAll(
		/`(components|utils|handbook|overview)\/([\w-]+)(?:\.md)?`/g
	))
		if (!existsSync(join(docsRoutes, section, name, '+page.md')))
			fail(file, `no docs route for ${section}/${name}`);

	for (const [, attr] of text.matchAll(/\bdata-([a-z][a-z-]*[a-z])\b/g))
		if (
			!['size', 'icon'].includes(attr) &&
			!libSource.includes(`'data-${attr}'`) &&
			!libSource.includes(`"data-${attr}"`) &&
			!new RegExp(
				`\\b${attr.replace(/-(\w)/g, (_, c) => c.toUpperCase())}\\s*[:=]\\s*'data-${attr}'`
			).test(libSource) &&
			!libSource.includes(`data-${attr}`)
		)
			fail(file, `unknown data attribute data-${attr}`);

	for (const [, variable] of text.matchAll(/(?<![\w-])(--[a-z][a-z-]*[a-z])\b/g))
		if (!libSource.includes(variable)) fail(file, `unknown CSS variable ${variable}`);

	for (const [, reason] of text.matchAll(/'([a-z]+(?:-[a-z]+)+)'/g))
		if (!libSource.includes(`'${reason}'`)) fail(file, `unknown change reason '${reason}'`);

	for (const [, name] of text.matchAll(
		/`(\w+(?:Props|State|Actions|DataAttributes|CssVariables|ChangeEventDetails|ChangeReason|Snippet|EventDetails))\b/g
	))
		if (!exportedTypes.has(name)) fail(file, `unknown export ${name}`);

	for (const [, entry] of text.matchAll(/(?<!node_modules\/)@sveltery\/base\/([\w-]+)/g))
		if (!existsSync(join(lib, entry, 'index.ts')))
			fail(file, `no entry point @sveltery/base/${entry}`);
}

// Parts and props named in prose.
const indexes = new Map();
for (const entry of readdirSync(lib).filter((name) => existsSync(join(lib, name, 'index.ts')))) {
	const source = readFileSync(join(lib, entry, 'index.ts'), 'utf8');
	const name = /export const (\w+)(?:: \{| = \{)/.exec(source)?.[1];
	if (name) indexes.set(name, source);
}
const typeSource = walk(lib)
	.filter((file) => file.endsWith('types.ts'))
	.map((file) => readFileSync(file, 'utf8'))
	.join('\n');
for (const file of skillFiles) {
	const text = readFileSync(file, 'utf8');
	for (const [, namespace, part] of text.matchAll(/\b([A-Z]\w+)\.([A-Z]\w+)\b/g))
		if (
			indexes.has(namespace) &&
			!new RegExp(`\\b${part}\\b\\s*[:,}]`).test(indexes.get(namespace))
		)
			fail(file, `unknown part ${namespace}.${part}`);
	for (const [, prop] of text.matchAll(
		/`(?:bind:)?((?:on|default)[A-Z]\w*|[a-z]+[A-Z]\w*)(?:=[^`]*)?`/g
	))
		if (
			![
				'preventDefault',
				'getAnimations',
				'preventBaseUIHandler',
				'actionsRef',
				'className',
				'onClick',
				'onKeyDown',
				'allowPropagation',
				'mergeProps',
				'eventDetails',
				'onpaste'
			].includes(prop) &&
			!new RegExp(`\\b${prop}\\??:`).test(typeSource)
		)
			fail(file, `unknown prop ${prop}`);
}

// Compile the Svelte examples.
const entries = readdirSync(lib).filter((name) => existsSync(join(lib, name, 'index.ts')));
const namespaces = new Map();
for (const entry of entries)
	for (const [, name] of readFileSync(join(lib, entry, 'index.ts'), 'utf8').matchAll(
		/export const (\w+)(?:: \{| = \{)/g
	))
		namespaces.set(name, entry);
const stubs = {
	MyButton: "import MyButton from '../MyButton.svelte';",
	labels: 'const labels: Record<string, string> = {};',
	value: 'let value = $state<string | null>(null);',
	Fruit: 'type Fruit = { label: string; value: string };',
	inputEl: 'let inputEl: HTMLInputElement | undefined;',
	compact: 'const compact = false;'
};

const out = join(root, 'apps/docs/src/routes/__skill-check');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'blocks'), { recursive: true });
writeFileSync(
	join(out, 'MyButton.svelte'),
	`<script lang="ts">\n\timport type { HTMLButtonAttributes } from 'svelte/elements';\n\tlet { children, active, ...rest }: HTMLButtonAttributes & { active?: boolean } = $props();\n</script>\n\n<button {...rest} data-active={active}>{@render children?.()}</button>\n`
);
const sources = new Map();
let count = 0;
for (const file of skillFiles) {
	const text = readFileSync(file, 'utf8');
	for (const match of text.matchAll(/(\*\*Incorrect:\*\*\s*)?```svelte\n([\s\S]*?)```/g)) {
		if (match[1]) continue;
		let code = match[2];
		if (/^<!-- \w+\.svelte -->/.test(code) && !code.includes('@sveltery/base')) continue;
		const used = [...namespaces.keys()].filter((name) => new RegExp(`<${name}\\.`).test(code));
		const declared = (name) =>
			new RegExp(`(let|const|import|type)[^;\\n]*\\b${name}\\b`).test(code);
		const prelude = [
			...used
				.filter((name) => !declared(name))
				.map((name) => `import { ${name} } from '@sveltery/base/${namespaces.get(name)}';`),
			...Object.entries(stubs)
				.filter(([name]) => new RegExp(`\\b${name}\\b`).test(code) && !declared(name))
				.map(([, line]) => line)
		].join('\n\t');
		code = code.includes('<script lang="ts">')
			? code.replace('<script lang="ts">', `<script lang="ts">\n\t${prelude}`)
			: `<script lang="ts">\n\t${prelude}\n</script>\n\n${code}`;
		const name = `Block${++count}.svelte`;
		sources.set(name, `${relative(root, file)} (block ${count})`);
		writeFileSync(join(out, 'blocks', name), code);
	}
}

try {
	execFileSync(
		'pnpm',
		[
			'exec',
			'svelte-check',
			'--tsconfig',
			'./tsconfig.json',
			'--output',
			'machine',
			'--threshold',
			'error'
		],
		{
			cwd: join(root, 'apps/docs'),
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		}
	);
} catch (error) {
	for (const line of String(error.stdout).split('\n')) {
		const m = /^\d+ ERROR "src\/routes\/__skill-check\/(?:blocks\/)?([^"]+)" (\d+:\d+) (.*)$/.exec(
			line
		);
		if (m) errors.push(`${sources.get(m[1]) ?? m[1]} ${m[2]}: ${m[3]}`);
	}
} finally {
	rmSync(out, { recursive: true, force: true });
}

console.log(`Checked ${skillFiles.length} files and ${count} Svelte examples.`);
if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}
