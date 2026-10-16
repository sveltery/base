// Compares every page's rendered API tables between two docs builds, and checks each change
// against Base UI's `types.md` at the pinned commit.
// Usage, from apps/docs:
//   node scripts/compare-api-tables.ts <base prerendered dir> <head prerendered dir> <base-ui checkout>
// Exits 1 when a table changed in a way upstream does not account for.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [baseDir, headDir, upstream] = process.argv.slice(2);
if (!upstream)
	throw new Error('usage: compare-api-tables.ts <base dir> <head dir> <base-ui checkout>');
const upstreamDocs = join(upstream, 'docs/src/app/(docs)/react');

type Row = { name: string; text: string };
type Section = {
	props: Row[];
	state: Row[];
	attributes: Row[];
	variables: Row[];
	/** Everything else in the section: the description, the empty-props note, prose. */
	rest: string;
};

const ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', '#39': "'" };
const text = (html: string) =>
	html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&(lt|gt|amp|quot|#39);/g, (_, entity) => ENTITIES[entity])
		.replace(/\s+/g, ' ')
		.trim();

const accordionRows = (html: string, label: string): Row[] => {
	const block = new RegExp(`<section[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</section>`).exec(
		html
	)?.[1];
	return (block?.split('<details').slice(1) ?? []).map((row) => ({
		name: text(/<code[^>]*>([\s\S]*?)<\/code>/.exec(row)![1]).replace(/\s*\*$/, ''),
		text: text(row)
	}));
};

const tableRows = (html: string, label: string): Row[] =>
	[...html.matchAll(/<div class="TableRoot ReferenceTableRoot[\s\S]*?<\/table>/g)]
		.filter((table) => text(/<th[^>]*>([\s\S]*?)<\/th>/.exec(table[0])![1]) === label)
		.flatMap((table) =>
			[
				...table[0].matchAll(/<th scope="row"[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g)
			].map(([, name, description]) => ({ name: text(name), text: text(description) }))
		);

const BLOCKS =
	/<section[^>]*aria-label="(Props|States)"[\s\S]*?<\/section>|<section class="AccordionRoot ReferenceAccordionRoot[^"]*min-\[32rem\]:hidden"[\s\S]*?<\/section>|<div class="TableRoot ReferenceTableRoot[\s\S]*?<\/table>\s*<\/div>/g;

/** A page's API sections, keyed by `### heading`. */
function apiSections(file: string): Map<string, Section> {
	const html = readFileSync(file, 'utf8').replace(/<!--(\[-?\d*|\]|)-->/g, '');
	const start = html.indexOf('id="api-reference"');
	const sections = new Map<string, Section>();
	if (start === -1) return sections;
	const api = html.slice(start, html.indexOf('</main>', start));
	for (const chunk of api.split(/<h3\b/).slice(1)) {
		const heading = text(/>([\s\S]*?)<\/h3>/.exec(chunk)![1]);
		const body = chunk.slice(chunk.indexOf('</h3>') + 5);
		sections.set(heading, {
			props: accordionRows(body, 'Props'),
			state: accordionRows(body, 'States'),
			attributes: tableRows(body, 'Attribute'),
			variables: tableRows(body, 'CSS Variable'),
			rest: text(body.replace(BLOCKS, ''))
		});
	}
	return sections;
}

type UpstreamPart = { props: string[]; attributes: Row[]; variables: Row[] };

const plain = (markdown: string) =>
	markdown
		.replace(/&#xA;/g, ' ')
		.replace(/\\\|/g, '|')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/`/g, '')
		.replace(/\s+/g, ' ')
		.trim();

/** Upstream's tables, keyed by part, from `types.md`. */
function upstreamParts(route: string): Map<string, UpstreamPart> | undefined {
	const file = join(upstreamDocs, route, 'types.md');
	if (!existsSync(file)) return undefined;
	const parts = new Map<string, UpstreamPart>();
	const table = (section: string, label: string) => {
		const at = section.indexOf(`${label}:**`);
		if (at === -1) return [];
		return section
			.slice(at)
			.split('\n')
			.slice(4)
			.filter(
				(line, i, lines) =>
					line.startsWith('|') && lines.slice(0, i).every((l) => l.startsWith('|'))
			)
			.map((line) => line.split(/(?<!\\)\|/).map((cell) => cell.trim()));
	};
	for (const section of readFileSync(file, 'utf8').split(/^### /m).slice(1)) {
		const name = section.slice(0, section.indexOf('\n'));
		if (name.includes('.')) continue;
		const constants = (label: string) =>
			table(section, label).map((cells) => ({ name: plain(cells[1]), text: plain(cells[3]) }));
		parts.set(name, {
			props: table(section, 'Props').map((cells) => cells[1]),
			attributes: constants('Data Attributes'),
			variables: constants('CSS Variables')
		});
	}
	return parts;
}

/** Svelte spells these the way the HTML attribute is spelled. */
const UPSTREAM_NAMES: Record<string, string> = {
	class: 'className',
	readonly: 'readOnly',
	onclick: 'onClick'
};

const names = (rows: Row[]) => rows.map((row) => row.name).join(', ');
const multiset = (rows: Row[]) =>
	rows
		.map((row) => row.text)
		.sort()
		.join('\n');
// A union's members as a set: the base build printed them in whatever order the pages read before
// this one left TypeScript's shared checker in.
const unionMembers = (rows: Row[]) =>
	rows
		.map((row) =>
			row.text
				.split(/ \| | (?=")|(?<=") /)
				.sort()
				.join(' ')
		)
		.sort()
		.join('\n');

const report: Array<{ explained: boolean; line: string }> = [];
const note = (explained: boolean, line: string) => report.push({ explained, line });

function pages(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return pages(path);
		return name.endsWith('.html') ? [path] : [];
	});
}

for (const file of pages(baseDir).sort()) {
	const route = relative(baseDir, file).replace(/\.html$/, '');
	const headFile = join(headDir, `${route}.html`);
	const before = apiSections(file);
	if (!before.size) continue;
	const after = apiSections(headFile);
	const theirs = upstreamParts(route);
	for (const [heading, base] of before) {
		const head = after.get(heading);
		const at = `${route} ${heading}`;
		if (!head) {
			note(false, `${at}: section missing`);
			continue;
		}
		if (base.rest !== head.rest)
			note(false, `${at}: text changed\n  base: ${base.rest}\n  head: ${head.rest}`);
		for (const kind of ['props', 'state'] as const) {
			if (multiset(base[kind]) !== multiset(head[kind])) {
				const reordered = unionMembers(base[kind]) === unionMembers(head[kind]);
				note(
					reordered,
					`${at}: ${kind} rows changed${reordered ? ': union members reordered, no longer by the pages read before' : ''}`
				);
			} else if (kind === 'state' && names(base[kind]) !== names(head[kind])) {
				note(
					true,
					`${at}: state reordered, no longer by the pages read before\n  base: ${names(base[kind])}\n  head: ${names(head[kind])}`
				);
			} else if (names(base[kind]) !== names(head[kind])) {
				const upstreamOrder = theirs?.get(heading)?.props ?? [];
				const ours = head.props
					.map((row) => UPSTREAM_NAMES[row.name] ?? row.name)
					.filter((name) => upstreamOrder.includes(name));
				const expected = upstreamOrder.filter((name) => ours.includes(name));
				const same = ours.join() === expected.join();
				note(
					same,
					`${at}: props reordered to type-order\n  base: ${names(base.props)}\n  head: ${names(head.props)}` +
						(same ? '' : `\n  upstream: ${expected.join(', ')}`)
				);
			}
		}
		for (const kind of ['attributes', 'variables'] as const) {
			const wanted = theirs?.get(heading)?.[kind] ?? [];
			if (JSON.stringify(base[kind]) === JSON.stringify(head[kind])) continue;
			const matchesUpstream =
				names(head[kind]) === names(wanted) &&
				head[kind].every((row, i) => row.text === wanted[i].text);
			note(
				matchesUpstream,
				`${at}: ${kind} now generated${matchesUpstream ? ', equal to upstream' : ''}\n  base: ${names(base[kind])}\n  head: ${names(head[kind])}` +
					(matchesUpstream
						? ''
						: `\n  upstream: ${names(wanted)}` +
							head[kind]
								.filter(
									(row, i) =>
										wanted[i] && row.name === wanted[i].name && row.text !== wanted[i].text
								)
								.map(
									(row) =>
										`\n  ${row.name}\n    ours:     ${row.text}\n    upstream: ${wanted.find((w) => w.name === row.name)!.text}`
								)
								.join(''))
			);
		}
	}
	for (const heading of after.keys()) {
		if (!before.has(heading)) note(false, `${route} ${heading}: section added`);
	}
}

const showAll = process.argv.includes('--all');
for (const { explained, line } of report) {
	if (showAll || !explained) console.log(`[${explained ? 'explained' : 'unexplained'}] ${line}`);
}
const unexplained = report.filter((entry) => !entry.explained).length;
console.log(`\n${report.length} difference(s), ${unexplained} unexplained`);
process.exit(unexplained ? 1 : 0);
