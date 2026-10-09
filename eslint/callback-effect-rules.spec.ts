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

describe('owned hits are gone and blocked hits remain', () => {
	it('leaves slider callbacks and the label-id helpers', async () => {
		const slider = readFileSync('src/lib/slider/model.svelte.ts', 'utf8');
		const [sliderResult] = await lint(slider, 'src/lib/slider/model.svelte.ts');
		const callbacks = lines(
			slider,
			sliderResult?.messages ?? [],
			'sveltery/no-public-callback-untracked'
		);
		expect(callbacks).toHaveLength(3);

		const helper = readFileSync('src/lib/internal/register-label-id.svelte.ts', 'utf8');
		const [helperResult] = await lint(helper, 'src/lib/internal/register-label-id.svelte.ts');
		const updater = lines(helper, helperResult?.messages ?? [], 'sveltery/no-state-updater');
		expect(updater.some((line) => line.includes('LabelIdUpdate'))).toBe(true);
		expect(updater.some((line) => line.includes('(current)'))).toBe(true);

		const fieldset = readFileSync('src/lib/fieldset/register-label-id.svelte.ts', 'utf8');
		const [fieldsetResult] = await lint(fieldset, 'src/lib/fieldset/register-label-id.svelte.ts');
		expect(
			lines(fieldset, fieldsetResult?.messages ?? [], 'sveltery/no-state-updater').some((line) =>
				line.includes('(current)')
			)
		).toBe(true);

		const context = readFileSync('src/lib/fieldset/context.svelte.ts', 'utf8');
		const [contextResult] = await lint(context, 'src/lib/fieldset/context.svelte.ts');
		expect(
			lines(context, contextResult?.messages ?? [], 'sveltery/no-state-updater').length
		).toBeGreaterThan(0);

		const labelable = readFileSync('src/lib/field/labelable.svelte.ts', 'utf8');
		const [labelableResult] = await lint(labelable, 'src/lib/field/labelable.svelte.ts');
		expect(lines(labelable, labelableResult?.messages ?? [], 'sveltery/no-state-updater')).toEqual(
			[]
		);

		const accordion = readFileSync('src/lib/accordion/context.svelte.ts', 'utf8');
		const [accordionResult] = await lint(accordion, 'src/lib/accordion/context.svelte.ts');
		expect(
			lines(accordion, accordionResult?.messages ?? [], 'sveltery/no-public-callback-untracked')
		).toEqual([]);
	});
});
