import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
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

const base = '90994ba84434f172f80c6c90b1acfbc395c89d2a';

function lint(code: string, filePath: string, cwd?: string) {
	const rules = Object.fromEntries(
		Object.keys(plugin.rules).map((name) => [`sveltery/${name}`, 'error'])
	);
	const eslint = new ESLint({
		cwd,
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
				rules
			},
			{
				files: ['**/*.{ts,js}'],
				languageOptions: {
					parser: tsParser,
					parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
				},
				plugins: { sveltery: plugin },
				rules
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

function show(path: string) {
	return execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8' });
}

function lines(source: string, messages: Linter.LintMessage[], ruleId: string) {
	const rows = source.split('\n');
	return messages
		.filter((message) => message.ruleId === ruleId)
		.map((message) => rows[(message.line ?? 1) - 1] ?? '');
}

describe('rules fail on 90994ba8', () => {
	it('flags functional label setters', async () => {
		const source = show('src/lib/field/labelable.svelte.ts');
		const [result] = await lint(source, 'src/lib/field/labelable.svelte.ts');
		const reported = lines(source, result?.messages ?? [], 'sveltery/no-state-updater');
		expect(reported.some((line) => line.includes('setLabelId'))).toBe(true);
		expect(reported.some((line) => line.includes('setMessageIds'))).toBe(true);
	});

	it('flags both change handlers and a tracked callback', async () => {
		const numberField = show('src/lib/number-field/NumberFieldRoot.svelte');
		const [numberResult] = await lint(numberField, 'src/lib/number-field/NumberFieldRoot.svelte');
		expect(
			lines(numberField, numberResult?.messages ?? [], 'sveltery/no-dual-change-handler').some(
				(line) => line.includes('onchange')
			)
		).toBe(true);

		const slider = show('src/lib/slider/model.svelte.ts');
		const [sliderResult] = await lint(slider, 'src/lib/slider/model.svelte.ts');
		const callbacks = lines(
			slider,
			sliderResult?.messages ?? [],
			'sveltery/no-public-callback-untracked'
		);
		expect(callbacks.some((line) => line.includes('getOnValueChange'))).toBe(true);
		expect(callbacks.some((line) => line.includes('getOnValueCommitted'))).toBe(true);
	});

	it('flags the OTP previous-value effect across the model module', async () => {
		const dir = mkdtempSync(path.join(tmpdir(), 'otp-base-'));
		const source = show('src/lib/otp-field/OTPFieldRoot.svelte');
		const file = path.join(dir, 'OTPFieldRoot.svelte');
		writeFileSync(file, source);
		writeFileSync(path.join(dir, 'model.svelte.ts'), show('src/lib/otp-field/model.svelte.ts'));
		const [result] = await lint(source, file, dir);
		const reported = lines(source, result?.messages ?? [], 'sveltery/no-previous-value-effect');
		expect(reported.some((line) => line.includes('noteValue'))).toBe(true);
	});
});

describe('hits that exist on this branch are clean', () => {
	it('leaves no updater or tracked-callback hits in the owned files', async () => {
		for (const file of [
			'src/lib/slider/model.svelte.ts',
			'src/lib/internal/register-label-id.svelte.ts',
			'src/lib/fieldset/register-label-id.svelte.ts',
			'src/lib/fieldset/context.svelte.ts',
			'src/lib/field/labelable.svelte.ts',
			'src/lib/accordion/context.svelte.ts',
			'src/lib/number-field/model.svelte.ts',
			'src/lib/otp-field/model.svelte.ts'
		]) {
			const source = readFileSync(file, 'utf8');
			const [result] = await lint(source, file);
			const messages = (result?.messages ?? []).filter((message) =>
				message.ruleId?.startsWith('sveltery/')
			);
			expect(messages, file).toEqual([]);
		}
	});
});
