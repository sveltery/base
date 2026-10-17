import { describe, it, expect } from 'vitest';
import { compile } from 'mdsvex';
import { mdsvexPlugins } from './headings.ts';
import { relativePaths } from './relative-paths.ts';

const routes = '/docs/src/routes';

async function href(url: string, filename = `${routes}/(docs)/components/+page.md`) {
	const compiled = await compile(`[x](${url})`, {
		filename,
		extensions: ['.md'],
		smartypants: false,
		remarkPlugins: mdsvexPlugins(relativePaths({ routes }))
	});
	return /href="([^"]*)"/.exec(compiled!.code)![1];
}

describe('relativePaths', () => {
	it('turns a relative page file into its URL', async () => {
		expect(await href('./accordion/+page.md')).toBe('/components/accordion');
	});

	it('resolves a parent folder and keeps the hash', async () => {
		expect(
			await href('../field/+page.md#labeling', `${routes}/(docs)/components/input/+page.md`)
		).toBe('/components/field#labeling');
	});

	it('strips the page file from an absolute link and keeps the query', async () => {
		expect(await href('/(docs)/handbook/forms/+page.md?tab=1#errors')).toBe(
			'/handbook/forms?tab=1#errors'
		);
	});

	it('leaves external links, hashes and other files alone', async () => {
		expect(await href('https://base-ui.com/react/+page.md')).toBe(
			'https://base-ui.com/react/+page.md'
		);
		expect(await href('#outline')).toBe('#outline');
		expect(await href('/components/menu')).toBe('/components/menu');
	});
});
