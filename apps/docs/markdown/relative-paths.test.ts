import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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
		assert.equal(await href('./accordion/+page.md'), '/components/accordion');
	});

	it('resolves a parent folder and keeps the hash', async () => {
		assert.equal(
			await href('../field/+page.md#labeling', `${routes}/(docs)/components/input/+page.md`),
			'/components/field#labeling'
		);
	});

	it('strips the page file from an absolute link and keeps the query', async () => {
		assert.equal(
			await href('/(docs)/handbook/forms/+page.md?tab=1#errors'),
			'/handbook/forms?tab=1#errors'
		);
	});

	it('leaves external links, hashes and other files alone', async () => {
		assert.equal(
			await href('https://base-ui.com/react/+page.md'),
			'https://base-ui.com/react/+page.md'
		);
		assert.equal(await href('#outline'), '#outline');
		assert.equal(await href('/components/menu'), '/components/menu');
	});
});
