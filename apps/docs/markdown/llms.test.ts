import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { docsOutputs, pageMarkdown } from './llms.ts';

const routes = fileURLToPath(new URL('../src/routes/(docs)', import.meta.url));
const sections = {
	Overview: 'overview',
	Handbook: 'handbook',
	Components: 'components',
	Utils: 'utils'
};

/** Compares with `__snapshots__/<name>`. `UPDATE_SNAPSHOTS=1` rewrites it. */
function matchSnapshot(name: string, actual: string) {
	const file = fileURLToPath(new URL(`__snapshots__/${name}`, import.meta.url));
	if (process.env.UPDATE_SNAPSHOTS) {
		mkdirSync(fileURLToPath(new URL('__snapshots__', import.meta.url)), { recursive: true });
		writeFileSync(file, actual);
	}
	assert.ok(existsSync(file), `${name} has no snapshot. Run with UPDATE_SNAPSHOTS=1.`);
	assert.equal(actual, readFileSync(file, 'utf8'));
}

const page = (body: string) =>
	`# Page\n\n<Subtitle>\n  A subtitle.\n</Subtitle>\n\n<Meta name="description" content="A description." />\n\n${body}\n`;

const markdown = (body: string) =>
	pageMarkdown(page(body), `${routes}/components/page/+page.md`, {
		href: '/components/page',
		hrefs: new Set(['/components/page', '/components/dialog']),
		routes
	});

describe('docsOutputs', async () => {
	const outputs = await docsOutputs(routes, sections);

	it('writes the Accordion twin', () => {
		matchSnapshot('accordion.md', outputs.pages['/components/accordion']);
	});

	it('writes llms.txt', () => {
		matchSnapshot('llms.txt', outputs.files['llms.txt']);
	});

	it('nests every page in llms-full.txt two heading levels down', () => {
		assert.match(outputs.files['llms-full.txt'], /\n### Accordion\n\nA set of collapsible panels/);
		assert.match(outputs.files['llms-full.txt'], /\n##### Root\.State\n/);
	});

	it('links each page of index.md relative to the site root', () => {
		assert.match(
			outputs.files['index.md'],
			/- \[Accordion\]\(\.\/components\/accordion\.md\): A set of collapsible panels/
		);
	});
});

describe('pageMarkdown', () => {
	it('reads the title, subtitle and description from the head', () => {
		const { title, subtitle, description, markdown: body } = markdown('Text.');
		assert.deepEqual([title, subtitle, description], ['Page', 'A subtitle.', 'A description.']);
		assert.equal(body, '# Page\n\nA description.\n\nText.\n');
	});

	it('fails on a component it has no markdown for', () => {
		assert.throws(() => markdown('<Callout />'), /Unknown component: Callout/);
	});

	it('keeps the HTML tags GitHub renders', () => {
		assert.match(markdown('Press <kbd>Esc</kbd>.').markdown, /Press <kbd>Esc<\/kbd>\./);
	});

	it('escapes a heading tag', () => {
		assert.match(markdown('## Filtering [Preview]').markdown, /## Filtering \\\[Preview]/);
	});

	it('points a link to another page at its twin', () => {
		assert.match(
			markdown('See [Dialog](/components/dialog).').markdown,
			/\]\(\/components\/dialog\.md\)/
		);
	});
});
