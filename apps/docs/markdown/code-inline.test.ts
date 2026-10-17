import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { codeInline } from './code-inline.ts';
import { elements } from './headings.ts';
import { markdownCode } from './markdown-code.ts';
import { render } from './testing.ts';

const code = async (markdown: string) =>
	(await render(markdown, { remark: [markdownCode, elements], rehype: [codeInline] })).html
		.replace(/^<p class="MdP">/, '')
		.replace(/<\/p>$/, '');

describe('markdownCode and codeInline', () => {
	it('highlights a code span as tsx by default', async () => {
		assert.equal(
			await code('`null`'),
			'<code class="Code MdCode language-tsx" data-inline><span style="color:var(--color-docs-infra-syntax-nullish)">null</span></code>'
		);
	});

	it('leaves the plain tokens to the code color', async () => {
		assert.equal(
			await code('`onOpenChange`'),
			'<code class="Code MdCode language-tsx" data-inline>onOpenChange</code>'
		);
	});

	it('takes the language from a {:lang} suffix', async () => {
		assert.equal(
			await code('`a { color: red }{:css}`'),
			'<code class="Code MdCode language-css" data-inline><span style="color:var(--color-prettylights-syntax-entity-tag)">a</span> &#123; <span style="color:var(--color-docs-infra-syntax-css-property)">color</span>: <span style="color:var(--color-prettylights-syntax-constant)">red</span> &#125;</code>'
		);
	});

	it('wraps an HTML tag and a component tag', async () => {
		assert.equal(
			await code('`<button>`'),
			'<code class="Code MdCode language-tsx" data-inline><span class="di-ht">&lt;<span style="color:var(--color-prettylights-syntax-entity-tag)">button</span>&gt;</span></code>'
		);
		assert.equal(
			await code('`<Field.Label />`'),
			'<code class="Code MdCode language-tsx" data-inline><span class="di-jt">&lt;<span style="color:var(--color-docs-infra-syntax-jsx-tag)">Field.Label</span> /&gt;</span></code>'
		);
	});

	it('highlights a bare object as an expression', async () => {
		assert.equal(
			await code('`{ open: true }`'),
			'<code class="Code MdCode language-tsx" data-inline>&#123; open: <span style="color:var(--color-prettylights-syntax-constant)">true</span> &#125;</code>'
		);
	});

	it('unescapes a pipe in a table cell, as GFM does', async () => {
		const { html } = await render('| Type |\n| --- |\n| `a \\| b` |\n', {
			remark: [markdownCode, elements],
			rehype: [codeInline]
		});
		assert.match(
			html,
			/>a <span style="color:var\(--color-prettylights-syntax-keyword\)">\|<\/span> b<\/code>/
		);
	});

	it('leaves a language Shiki has not loaded unhighlighted', async () => {
		assert.equal(await code('`x{:cobol}`'), '<code class="Code MdCode language-cobol">x</code>');
	});
});
