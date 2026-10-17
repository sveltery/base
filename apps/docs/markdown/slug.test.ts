import { describe, it, expect } from 'vitest';
import type { HastNode } from './headings.ts';
import { slug, stringToUrl } from './slug.ts';

const heading = (depth: number, text: string): HastNode => ({
	type: 'element',
	tagName: `h${depth}`,
	properties: {},
	children: [{ type: 'text', value: text }]
});

function slugIds(children: HastNode[], options?: { prefix?: string }) {
	const tree = { type: 'root', children };
	slug(options)(tree);
	return tree.children.map((node) => node.properties!.id);
}

describe('slug', () => {
	it('adds a slug id to a heading', () => {
		expect(slugIds([heading(2, 'Getting started')])).toEqual(['getting-started']);
	});

	it('suffixes repeated heading text so ids stay unique', () => {
		expect(slugIds([heading(2, 'Props'), heading(3, 'Props'), heading(3, 'Props')])).toEqual([
			'props',
			'props-1',
			'props-2'
		]);
	});

	it('does not collide when later heading text matches an already-suffixed slug', () => {
		expect(slugIds([heading(2, 'Props'), heading(2, 'Props'), heading(2, 'Props 1')])).toEqual([
			'props',
			'props-1',
			'props-1-1'
		]);
	});

	it('applies the prefix before deduplicating', () => {
		expect(slugIds([heading(2, 'Props'), heading(2, 'Props')], { prefix: 'api-' })).toEqual([
			'api-props',
			'api-props-1'
		]);
	});

	it('leaves a heading that already has an id untouched', () => {
		const custom = heading(2, 'Props');
		custom.properties!.id = 'custom-id';
		expect(slugIds([custom])).toEqual(['custom-id']);
	});

	it('suffixes a later heading that collides with a pre-existing id', () => {
		const explicit = heading(2, 'Something');
		explicit.properties!.id = 'props';
		expect(slugIds([explicit, heading(2, 'Props')])).toEqual(['props', 'props-1']);
	});

	it('ignores non-heading elements', () => {
		const paragraph: HastNode = { type: 'element', tagName: 'p', properties: {}, children: [] };
		slug()({ type: 'root', children: [paragraph] });
		expect(paragraph.properties!.id).toBe(undefined);
	});

	it('reads the text mdsvex escaped', () => {
		expect(slugIds([heading(2, '&lt;Field.Root&gt; and &#123;value&#125;')])).toEqual([
			'field-root-and-value'
		]);
	});
});

describe('stringToUrl', () => {
	it('kebab-cases and strips punctuation', () => {
		expect(stringToUrl('1. Here’s a wicked example & more.')).toBe(
			'1-here-is-a-wicked-example-and-more'
		);
	});

	it('expands common contractions', () => {
		expect(stringToUrl("you'll won't stop")).toBe('you-will-will-not-stop');
	});
});
