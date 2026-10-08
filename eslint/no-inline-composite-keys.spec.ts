import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import { historicalSource } from './historical-source.js';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;
const tsParser = ts.parser;
const ruleId = 'sveltery/no-inline-composite-keys';
const main = '1504e68fea742baf23edbad7817e41cdca383688';

function lint(code: string, filePath: string) {
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

function hits(source: string, messages: Linter.LintMessage[], line: number) {
	return messages.some((message) => {
		const start = message.line ?? 0;
		const end = message.endLine ?? start;
		return line >= start && line <= end;
	});
}

describe('sveltery/no-inline-composite-keys', () => {
	it('rejects the inline composite sets on current main', async () => {
		const tabs = historicalSource(
			main,
			'src/lib/tabs/roving-focus.svelte.ts',
			new URL('fixtures/history/1504e68f-tabs-roving-focus.svelte.ts', import.meta.url),
			'116e873029460363175786782e0c5050dc480c8a'
		);
		const toggles = historicalSource(
			main,
			'src/lib/toggle-group/roving-focus.svelte.ts',
			new URL('fixtures/history/1504e68f-toggle-group-roving-focus.svelte.ts', import.meta.url),
			'12a349b97bb08ff2c570f2d2944a94ea4b77515f'
		);
		const [tabsResult] = await lint(tabs, 'src/lib/tabs/roving-focus.svelte.ts');
		const [toggleResult] = await lint(toggles, 'src/lib/toggle-group/roving-focus.svelte.ts');
		const tabsMessages = (tabsResult?.messages ?? []).filter(
			(message) => message.ruleId === ruleId
		);
		const toggleMessages = (toggleResult?.messages ?? []).filter(
			(message) => message.ruleId === ruleId
		);
		expect(hits(tabs, tabsMessages, 19)).toBe(true);
		expect(hits(toggles, toggleMessages, 17)).toBe(true);
		expect(tabsMessages[0]?.message).toContain('COMPOSITE_KEYS');
	});
});
