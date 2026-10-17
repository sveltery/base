import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { docsOutputs, pageMarkdown } from './llms.ts';

const routes = fileURLToPath(new URL('../src/routes/(docs)', import.meta.url));
const sections = {
	Overview: 'overview',
	Handbook: 'handbook',
	Components: 'components',
	Utils: 'utils'
};

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

	it('writes the Accordion twin', async () => {
		await expect(outputs.pages['/components/accordion']).toMatchFileSnapshot(
			'__snapshots__/accordion.md'
		);
	});

	it('writes llms.txt', async () => {
		await expect(outputs.files['llms.txt']).toMatchFileSnapshot('__snapshots__/llms.txt');
	});

	it('nests every page in llms-full.txt two heading levels down', () => {
		expect(outputs.files['llms-full.txt']).toMatch(
			/\n### Accordion\n\nA set of collapsible panels/
		);
		expect(outputs.files['llms-full.txt']).toMatch(/\n##### Root\.State\n/);
	});

	it('links each page of index.md relative to the site root', () => {
		expect(outputs.files['index.md']).toMatch(
			/- \[Accordion\]\(\.\/components\/accordion\.md\): A set of collapsible panels/
		);
	});
});

describe('pageMarkdown', () => {
	it('reads the title, subtitle and description from the head', () => {
		const { title, subtitle, description, markdown: body } = markdown('Text.');
		expect([title, subtitle, description]).toEqual(['Page', 'A subtitle.', 'A description.']);
		expect(body).toBe('planted failure');
	});

	it('fails on a component it has no markdown for', () => {
		expect(() => markdown('<Callout />')).toThrow(/Unknown component: Callout/);
	});

	it('keeps the HTML tags GitHub renders', () => {
		expect(markdown('Press <kbd>Esc</kbd>.').markdown).toMatch(/Press <kbd>Esc<\/kbd>\./);
	});

	it('escapes a heading tag', () => {
		expect(markdown('## Filtering [Preview]').markdown).toMatch(/## Filtering \\\[Preview]/);
	});

	it('points a link to another page at its twin', () => {
		expect(markdown('See [Dialog](/components/dialog).').markdown).toMatch(
			/\]\(\/components\/dialog\.md\)/
		);
	});
});
