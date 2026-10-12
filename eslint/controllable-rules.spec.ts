import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;
const tsParser = ts.parser;

function lint(code: string, filePath: string, ruleName: string) {
	const ruleId = `sveltery/${ruleName}`;
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files: ['**/*.{ts,svelte,svelte.ts}'],
				languageOptions: {
					parser: filePath.endsWith('.svelte') ? svelteParser : tsParser,
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module',
						extraFileExtensions: ['.svelte'],
						parser: tsParser
					}
				},
				plugins: { sveltery: plugin },
				rules: { [ruleId]: 'error' }
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

async function messagesFor(code: string, filePath: string, ruleName: string) {
	const [result] = await lint(code, filePath, ruleName);
	return (result?.messages ?? []).filter((message) => message.ruleId === `sveltery/${ruleName}`);
}

describe('sveltery/no-uncontrolled-bindable', () => {
	it('rejects a bindable alias that never reaches the helper', async () => {
		const source = [
			'const bind = $bindable;',
			'let { checked = $bindable(false), pressed = bind(false) } = $props();'
		].join('\n');
		const messages = await messagesFor(source, 'alias.ts', 'no-uncontrolled-bindable');
		expect(messages.length).toBeGreaterThanOrEqual(2);
		expect(messages.some((message) => message.message.includes('pressed'))).toBe(true);
		expect(messages.some((message) => message.message.includes('checked'))).toBe(true);
	});

	it('rejects a bind:name comment that is not a forward', async () => {
		const source = readFileSync(
			new URL('fixtures/uncontrolled-bindable-comment.fail.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(
			source,
			'uncontrolled-bindable-comment.fail.svelte',
			'no-uncontrolled-bindable'
		);
		expect(source).toContain('// bind:value');
		expect(messages.some((message) => message.message.includes('value'))).toBe(true);
	});

	it('allows the helper and a bind: forward', async () => {
		const source = readFileSync(
			new URL('fixtures/uncontrolled-bindable.pass.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(
			source,
			'uncontrolled-bindable.pass.svelte',
			'no-uncontrolled-bindable'
		);
		expect(messages).toEqual([]);
	});
});
