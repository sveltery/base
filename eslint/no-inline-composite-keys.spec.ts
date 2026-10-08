import { execFileSync } from 'node:child_process';
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
		const tabs = execFileSync('git', ['show', `${main}:src/lib/tabs/roving-focus.svelte.ts`], {
			encoding: 'utf8'
		});
		const toggles = execFileSync(
			'git',
			['show', `${main}:src/lib/toggle-group/roving-focus.svelte.ts`],
			{ encoding: 'utf8' }
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
