// Moves each `content/<section>/<slug>.md` to `src/routes/(docs)/<section>/<slug>/+page.md` and
// turns its frontmatter into the head of a Base UI page: `# Title`, `<Subtitle>`, `<Meta>`.
// Run with `node scripts/move-pages-to-routes.ts` from apps/docs.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const docs = new URL('..', import.meta.url).pathname;
const content = join(docs, 'content');
const routes = join(docs, 'src/routes/(docs)');

const plainText = (value: string) => value.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');

function frontmatter(file: string, source: string) {
	const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
	if (!match) throw new Error(`${file}: no frontmatter`);
	const fields: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const field = /^(\w+):\s*(.*)$/.exec(line);
		if (!field) throw new Error(`${file}: unexpected frontmatter line "${line}"`);
		fields[field[1]] = field[2].replace(/^(['"])(.*)\1$/, '$2');
	}
	return { fields, body: source.slice(match[0].length).replace(/^\n+/, '') };
}

if (!existsSync(content)) {
	console.log('Nothing to move: content/ is gone.');
	process.exit(0);
}

const order: Record<string, string[]> = {};
const navTitles: Record<string, string> = {};

for (const section of readdirSync(content)) {
	for (const name of readdirSync(join(content, section)).filter((file) => file.endsWith('.md'))) {
		const file = join(content, section, name);
		const slug = name.replace(/\.md$/, '');
		const { fields, body } = frontmatter(file, readFileSync(file, 'utf8'));
		const { title, description, navTitle, order: position, ...rest } = fields;
		if (!title || !description) throw new Error(`${file}: needs a title and a description`);
		if (Object.keys(rest).length) throw new Error(`${file}: unknown fields ${Object.keys(rest)}`);
		const meta = plainText(description);
		if (meta.includes('"')) throw new Error(`${file}: the description has a double quote`);

		const target = join(routes, section, slug, '+page.md');
		mkdirSync(join(routes, section, slug), { recursive: true });
		writeFileSync(
			target,
			`# ${title}\n\n<Subtitle>\n  ${description}\n</Subtitle>\n\n<Meta name="description" content="${meta}" />\n\n${body}`
		);
		if (position) (order[section] ??= [])[Number(position) - 1] = slug;
		if (navTitle) navTitles[`/${section}/${slug}`] = navTitle;
	}
}

rmSync(content, { recursive: true });
console.log('Nav order and titles for content.server.ts:');
console.log(JSON.stringify({ order, navTitles }, null, '\t'));
