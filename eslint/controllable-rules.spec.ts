import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
const main = '2984bb24a98a474ffad5df8da434af93f0f03472';

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

function hits(messages: Linter.LintMessage[], line: number) {
	return messages.some((message) => {
		const start = message.line ?? 0;
		const end = message.endLine ?? start;
		return line >= start && line <= end;
	});
}

async function messagesFor(code: string, filePath: string, ruleName: string) {
	const [result] = await lint(code, filePath, ruleName);
	return (result?.messages ?? []).filter((message) => message.ruleId === `sveltery/${ruleName}`);
}

describe('sveltery/no-late-bound-getter', () => {
	it('rejects placeholders, later arrows, and Object.assign bags', async () => {
		const source = readFileSync(
			new URL('fixtures/late-bound-getter.fail.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(
			source,
			'late-bound-getter.fail.svelte',
			'no-late-bound-getter'
		);
		const lines = source.split('\n');
		const reported = messages.map((message) => lines[(message.line ?? 1) - 1] ?? '');
		expect(reported.some((line) => line.includes('readValues: () => string[]'))).toBe(true);
		expect(reported.some((line) => line.includes('placementReader'))).toBe(true);
		expect(reported.some((line) => line.includes('this.readValues = () =>'))).toBe(true);
		expect(reported.some((line) => line.includes('model.readDisabled'))).toBe(true);
		expect(reported.some((line) => line.includes('Object.assign(model, { readValues })'))).toBe(
			true
		);
		expect(reported.some((line) => line.includes('readDisabled: () => false'))).toBe(true);
		expect(reported.some((line) => line.includes('model.commit'))).toBe(false);
		expect(reported.some((line) => line.includes('this.readThreshold = readThreshold'))).toBe(
			false
		);
	});

	it('allows constructor identifier assignment', async () => {
		const source = readFileSync(
			new URL('fixtures/late-bound-getter.pass.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(
			source,
			'late-bound-getter.pass.svelte',
			'no-late-bound-getter'
		);
		expect(messages).toEqual([]);
	});

	it('rejects the late-bound getters on main', async () => {
		const cases = [
			{
				commitPath: 'src/lib/tabs/context.svelte.ts',
				fixture: 'fixtures/history/2984bb24-tabs-context.svelte.ts',
				blob: 'b34109fe1a3dffda90108635dfeca21ffd015125',
				lines: [36, 39, 237]
			},
			{
				commitPath: 'src/lib/popover/store.svelte.ts',
				fixture: 'fixtures/history/2984bb24-popover-store.svelte.ts',
				blob: '6747fe584cff9aee07586a4a7232aad99a23178f',
				lines: [57]
			},
			{
				commitPath: 'src/lib/accordion/context.svelte.ts',
				fixture: 'fixtures/history/2984bb24-accordion-context.svelte.ts',
				blob: '6ed9b76425f33ffd477f68c06cbb25a9c656156a',
				lines: [17]
			},
			{
				commitPath: 'src/lib/toggle-group/context.svelte.ts',
				fixture: 'fixtures/history/2984bb24-toggle-group-context.svelte.ts',
				blob: 'd5121b162de94d22b715ff04ce094270933350ce',
				lines: [13, 14, 15, 17]
			}
		];

		for (const entry of cases) {
			const source = historicalSource(
				main,
				entry.commitPath,
				new URL(entry.fixture, import.meta.url),
				entry.blob
			);
			const messages = await messagesFor(source, entry.commitPath, 'no-late-bound-getter');
			for (const line of entry.lines) expect(hits(messages, line), entry.commitPath).toBe(true);
		}
	});
});

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

	it('rejects the unbound roots on main', async () => {
		const cases = [
			{
				commitPath: 'src/lib/switch/SwitchRoot.svelte',
				fixture: 'fixtures/history/2984bb24-SwitchRoot.svelte',
				blob: '121be511fe2958ea2c2d751d6541e741693a3f29',
				lines: [25]
			},
			{
				commitPath: 'src/lib/otp-field/OTPFieldRoot.svelte',
				fixture: 'fixtures/history/2984bb24-OTPFieldRoot.svelte',
				blob: '80477d7ea68df5b7fd02f464ef8584217e90806c',
				lines: [47]
			},
			{
				commitPath: 'src/lib/accordion/AccordionRoot.svelte',
				fixture: 'fixtures/history/2984bb24-AccordionRoot.svelte',
				blob: '9a186585beb85c2255ab74a59fee53e9367275c2',
				lines: [15]
			}
		];

		for (const entry of cases) {
			const source = historicalSource(
				main,
				entry.commitPath,
				new URL(entry.fixture, import.meta.url),
				entry.blob
			);
			const messages = await messagesFor(source, entry.commitPath, 'no-uncontrolled-bindable');
			for (const line of entry.lines) expect(hits(messages, line), entry.commitPath).toBe(true);
		}
	});
});

describe('sveltery/no-previous-value-effect on main', () => {
	it('rejects the tabs direction baseline', async () => {
		const source = historicalSource(
			main,
			'src/lib/tabs/context.svelte.ts',
			new URL('fixtures/history/2984bb24-tabs-context.svelte.ts', import.meta.url),
			'b34109fe1a3dffda90108635dfeca21ffd015125'
		);
		const messages = await messagesFor(
			source,
			'src/lib/tabs/context.svelte.ts',
			'no-previous-value-effect'
		);
		expect(hits(messages, 64)).toBe(true);
	});
});
