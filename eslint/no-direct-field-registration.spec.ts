import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
const ruleId = 'sveltery/no-direct-field-registration';
const main = '76c3d79fdbb49c2bea0782b911c8894edd3479cd';

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

function hits(messages: Linter.LintMessage[], line: number) {
	return messages.some((message) => {
		const start = message.line ?? 0;
		const end = message.endLine ?? start;
		return line >= start && line <= end;
	});
}

async function messagesFor(code: string, filePath: string) {
	const [result] = await lint(code, filePath);
	return (result?.messages ?? []).filter((message) => message.ruleId === ruleId);
}

describe('sveltery/no-direct-field-registration', () => {
	it('rejects the hand-rolled registrations on main', async () => {
		const cases = [
			{
				commitPath: 'src/lib/field/FieldControl.svelte',
				fixture: 'fixtures/history/76c3d79f-FieldControl.svelte',
				blob: 'fe9d56641e3142185724e290425379767fef87cd',
				lines: [141, 142, 145, 146]
			},
			{
				commitPath: 'src/lib/number-field/NumberFieldInput.svelte',
				fixture: 'fixtures/history/76c3d79f-NumberFieldInput.svelte',
				blob: '745468e1387886f7ac6e2502603f1aff85fd8c86',
				lines: [57]
			},
			{
				commitPath: 'src/lib/number-field/model.svelte.ts',
				fixture: 'fixtures/history/76c3d79f-number-field-model.svelte.ts',
				blob: '2a6c81f911e29b77b5c65b580203e326ac0d4183',
				lines: [284, 288]
			},
			{
				commitPath: 'src/lib/slider/SliderRoot.svelte',
				fixture: 'fixtures/history/76c3d79f-SliderRoot.svelte',
				blob: 'a645dc16a423f11ceb6681761c1162dcb414c2e5',
				lines: [162, 163, 167, 174]
			},
			{
				commitPath: 'src/lib/otp-field/OTPFieldRoot.svelte',
				fixture: 'fixtures/history/76c3d79f-OTPFieldRoot.svelte',
				blob: '4c0c0f3dac28e37037487191d4339f5bb19be35c',
				lines: [175, 176, 178, 184]
			}
		];

		for (const entry of cases) {
			const source = historicalSource(
				main,
				entry.commitPath,
				new URL(entry.fixture, import.meta.url),
				entry.blob
			);
			const messages = await messagesFor(source, entry.commitPath);
			for (const line of entry.lines) expect(hits(messages, line)).toBe(true);
		}
	});

	it('resolves an alias of registerControl', async () => {
		const source = readFileSync(
			new URL('fixtures/direct-field-registration-alias.fail.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(source, 'src/lib/field/alias.svelte');
		expect(messages.length).toBeGreaterThan(0);
	});

	it('rejects destructuring, bind, call, apply, and a let alias', async () => {
		const source = readFileSync(
			new URL('fixtures/direct-field-registration-gaps.fail.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(source, 'src/lib/field/gaps.svelte');
		const lines = source.split('\n');
		const reported = messages.map((message) => lines[(message.line ?? 1) - 1] ?? '');
		expect(reported.some((line) => line.includes('registerControl(Symbol()'))).toBe(true);
		expect(reported.some((line) => line.includes('named(Symbol()'))).toBe(true);
		expect(reported.some((line) => line.includes('later(Symbol()'))).toBe(true);
		expect(reported.some((line) => line.includes('.call('))).toBe(true);
		expect(reported.some((line) => line.includes('.apply('))).toBe(true);
		expect(reported.some((line) => line.includes('.bind('))).toBe(true);
	});

	it('rejects registerControl under src/tests', async () => {
		const source = readFileSync(
			new URL('fixtures/direct-field-registration-gaps.fail.svelte', import.meta.url),
			'utf8'
		);
		const messages = await messagesFor(
			source,
			fileURLToPath(new URL('../src/tests/probe.svelte', import.meta.url))
		);
		expect(messages.length).toBeGreaterThan(0);
	});

	it('allows a different method and the shared helper', async () => {
		const pass = readFileSync(
			new URL('fixtures/direct-field-registration.pass.svelte', import.meta.url),
			'utf8'
		);
		expect((await messagesFor(pass, 'src/lib/field/pass.svelte')).length).toBe(0);
		const helper = readFileSync(
			new URL('../src/lib/internal/field-register-control.svelte.ts', import.meta.url),
			'utf8'
		);
		expect(
			(await messagesFor(helper, 'src/lib/internal/field-register-control.svelte.ts')).length
		).toBe(0);
	});
});
