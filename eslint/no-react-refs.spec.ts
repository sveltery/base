import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;
const tsParser = ts.parser;

const root = new URL('..', import.meta.url);
const failFixture = new URL('eslint/fixtures/form-ref-current.fail.svelte', root);
const passFixture = new URL('eslint/fixtures/bind-this-attach.pass.svelte', root);

const fixPhrases = [
	'let el = $state()',
	'bind:this={el}',
	'{@attach}',
	'createAttachmentKey'
] as const;

function ruleMessages(result: ESLint.LintResult | undefined) {
	return (result?.messages ?? []).filter((message) => message.ruleId === 'sveltery/no-react-refs');
}

function lintWithRule(code: string, filePath: string) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files: ['**/*.svelte'],
				languageOptions: {
					parser: svelteParser,
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module',
						extraFileExtensions: ['.svelte'],
						parser: tsParser
					}
				},
				plugins: { sveltery: plugin },
				rules: { 'sveltery/no-react-refs': 'error' }
			},
			{
				files: ['**/*.{ts,tsx,js,jsx}'],
				languageOptions: {
					parser: tsParser,
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module',
						ecmaFeatures: { jsx: true }
					}
				},
				plugins: { sveltery: plugin },
				rules: { 'sveltery/no-react-refs': 'error' }
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

async function messagesFor(code: string, filePath: string) {
	const [result] = await lintWithRule(code, filePath);
	return ruleMessages(result);
}

describe('sveltery/no-react-refs', () => {
	it('rejects the Form-style ref bag fixture and names the Svelte fix', async () => {
		const source = readFileSync(failFixture, 'utf8');
		const messages = await messagesFor(source, 'form-ref-current.fail.svelte');
		const lines = source.split('\n');
		const reported = messages.map((message) => lines[(message.line ?? 1) - 1] ?? '');

		expect(messages.length).toBeGreaterThan(0);
		for (const message of messages) {
			for (const phrase of fixPhrases) {
				expect(message.message).toContain(phrase);
			}
		}
		expect(reported.some((line) => line.includes('elementRef.current'))).toBe(true);
		expect(reported.some((line) => line.includes('formRef.current'))).toBe(true);
		expect(reported.some((line) => line.includes('controlRef.current'))).toBe(true);
		expect(reported.some((line) => line.includes('submitCountRef.current'))).toBe(true);
		expect(reported.some((line) => line.includes('controlRef: { current:'))).toBe(true);
		expect(reported.some((line) => line.includes('const controlRef'))).toBe(true);
	});

	it('allows $state, bind:this, and attachments', async () => {
		const source = readFileSync(passFixture, 'utf8');
		const [result] = await lintWithRule(source, 'bind-this-attach.pass.svelte');

		expect(source).toContain('let el = $state');
		expect(source).toContain('bind:this={el}');
		expect(source).toContain('{@attach rememberForm}');
		expect(source).toContain('createAttachmentKey');
		expect(source).toContain('event.currentTarget');
		expect(result?.messages ?? []).toEqual([]);
	});

	it('rejects useRef, createRef, forwardRef, and public ref props', async () => {
		const script = await messagesFor(
			[
				"import { createRef, forwardRef, useRef as useElementRef } from 'react';",
				'interface ButtonProps { ref?: HTMLButtonElement | null }',
				'const element = useElementRef<HTMLButtonElement>(null);',
				'const created = createRef<HTMLDivElement>();',
				'const Widget = forwardRef(function Widget(_props, ref) { return ref; });',
				'void element; void created; void Widget;'
			].join('\n'),
			'src/widget.ts'
		);
		expect(script.length).toBeGreaterThanOrEqual(5);
		for (const message of script) {
			for (const phrase of fixPhrases) expect(message.message).toContain(phrase);
		}

		const props = await messagesFor(
			[
				'<script lang="ts">',
				'	let { ref = $bindable<HTMLButtonElement | null>(null) } = $props();',
				'	void ref;',
				'</script>',
				'<button {ref}></button>',
				'<button ref={ref}></button>'
			].join('\n'),
			'src/Widget.svelte'
		);
		expect(props).toHaveLength(3);
	});

	it('allows callback parameters named current and event.currentTarget', async () => {
		const messages = await messagesFor(
			[
				'type LegendIdUpdate = string | undefined | ((current: string | undefined) => string | undefined);',
				'function onClick(event: { currentTarget: EventTarget | null }) {',
				'	return event.currentTarget;',
				'}',
				'const index = { currentPage: 1 };',
				'void index.currentPage;',
				'export function format(current: number) { return current; }'
			].join('\n'),
			'src/fieldset.ts'
		);
		expect(messages).toEqual([]);
	});

	it('the project config enforces the rule under src/ and leaves React reference fixtures alone', async () => {
		const eslint = new ESLint({ cwd: fileURLToPath(root) });
		const sample = "import { useRef } from 'react';\nconst el = useRef(null);\nvoid el;\n";
		const [library] = await eslint.lintText(sample, { filePath: 'src/lib/probe.ts' });
		const [reference] = await eslint.lintText(sample, {
			filePath: 'src/routes/fixtures/button/react-reference.ts'
		});

		expect(ruleMessages(library).length).toBeGreaterThan(0);
		expect(ruleMessages(reference)).toEqual([]);
	});
});
