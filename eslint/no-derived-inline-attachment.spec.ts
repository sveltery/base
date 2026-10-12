import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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
const ruleId = 'sveltery/no-derived-inline-attachment';

function lint(code: string, filePath: string) {
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
				rules: { [ruleId]: 'error' }
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

describe('sveltery/no-derived-inline-attachment', () => {
	it('rejects helper, conditional, bind, declaration, assignment, and a derived key', async () => {
		const source = readFileSync(
			new URL('fixtures/derived-inline-attachment.fail.svelte', import.meta.url),
			'utf8'
		);
		const [result] = await lint(source, 'src/lib/popover/derived-inline-attachment.fail.svelte');
		const messages = (result?.messages ?? []).filter((message) => message.ruleId === ruleId);
		const lines = source.split('\n');
		const reported = messages.map((message) =>
			lines.slice((message.line ?? 1) - 1, message.endLine ?? message.line).join('\n')
		);
		expect(reported.some((line) => line.includes('host(bindKey)'))).toBe(true);
		expect(reported.some((line) => line.includes('flag') && line.includes('?'))).toBe(true);
		expect(reported.some((line) => line.includes('.bind('))).toBe(true);
		expect(reported.some((line) => line.includes('[bindKey]: attach'))).toBe(true);
		expect(reported.some((line) => line.includes('[bindKey]: f'))).toBe(true);
		expect(reported.some((line) => line.includes('createAttachmentKey()'))).toBe(true);
		expect(messages.some((message) => message.message.includes('every read'))).toBe(false);
		expect(messages.some((message) => message.message.includes('dependency changes'))).toBe(true);
		expect(reported.some((line) => line.includes('bind:this'))).toBe(false);
	});

	it('accepts the stable bindTrigger on the current trigger', async () => {
		const source = readFileSync(new URL('src/lib/popover/PopoverTrigger.svelte', root), 'utf8');
		const [result] = await lint(source, 'src/lib/popover/PopoverTrigger.svelte');
		const messages = (result?.messages ?? []).filter((message) => message.ruleId === ruleId);
		expect(messages).toEqual([]);
	});
});
