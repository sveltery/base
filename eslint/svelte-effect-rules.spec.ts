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

function ruleMessages(result: ESLint.LintResult | undefined, ruleId: string) {
	return (result?.messages ?? []).filter((message) => message.ruleId === ruleId);
}

function lintWithRule(code: string, filePath: string, ruleName: string) {
	const ruleId = `sveltery/${ruleName}`;
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
			},
			{
				files: ['**/*.{ts,js}'],
				languageOptions: {
					parser: tsParser,
					parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
				},
				plugins: { sveltery: plugin },
				rules: { [ruleId]: 'error' }
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

async function messagesFor(fileName: string, ruleName: string) {
	const source = readFileSync(new URL(`eslint/fixtures/${fileName}`, root), 'utf8');
	const [result] = await lintWithRule(source, fileName, ruleName);
	return { source, messages: ruleMessages(result, `sveltery/${ruleName}`) };
}

function reportedLines(source: string, messages: Linter.LintMessage[]) {
	const lines = source.split('\n');
	return messages.map((message) => lines[(message.line ?? 1) - 1] ?? '');
}

describe('sveltery/no-prop-state-sync', () => {
	const ruleName = 'no-prop-state-sync';

	it('rejects copied prop-sync effects and names the Svelte fix', async () => {
		const { source, messages } = await messagesFor('prop-state-sync.fail.svelte', ruleName);
		const lines = reportedLines(source, messages);

		expect(messages.length).toBeGreaterThanOrEqual(3);
		for (const message of messages) {
			expect(message.message).toContain('model getter');
			expect(message.message).toContain('$bindable');
		}
		expect(lines.some((line) => line.includes('seenWrites'))).toBe(true);
		expect(lines.some((line) => line.includes('root.roving.loopFocus'))).toBe(true);
		expect(lines.some((line) => line.includes('disabledState = Boolean(disabled)'))).toBe(true);
	});

	it('allows model getters and a bindable setter', async () => {
		const { source, messages } = await messagesFor('prop-getters.pass.svelte', ruleName);
		expect(source).toContain('get value()');
		expect(source).toContain('value = next');
		expect(messages).toEqual([]);
	});
});

describe('sveltery/no-void-signal-read', () => {
	const ruleName = 'no-void-signal-read';

	it('rejects void signal reads and names the Svelte fix', async () => {
		const { source, messages } = await messagesFor('void-signal.fail.svelte', ruleName);
		const lines = reportedLines(source, messages);

		expect(messages.length).toBeGreaterThanOrEqual(5);
		for (const message of messages) {
			expect(message.message).toContain('void');
			expect(message.message).toContain('$derived');
		}
		expect(lines.some((line) => line.includes('void disabledState'))).toBe(true);
		expect(lines.some((line) => line.includes('void tab.disabled'))).toBe(true);
		expect(lines.some((line) => line.includes('void actions'))).toBe(true);
		expect(lines.some((line) => line.includes('void actions.validate'))).toBe(true);
	});

	it('allows passing signals into a function and publishing a bindable from an effect', async () => {
		const { source, messages } = await messagesFor('void-signal.pass.svelte', ruleName);
		expect(source).toContain('syncAfter(disabledState, focusableWhenDisabled)');
		expect(source).toContain('$derived.by');
		expect(messages).toEqual([]);
	});
});

describe('sveltery/no-split-effect-lifecycle', () => {
	const ruleName = 'no-split-effect-lifecycle';

	it('rejects split registration and addEventListener in effects', async () => {
		const { source, messages } = await messagesFor('split-lifecycle.fail.svelte', ruleName);
		const lines = reportedLines(source, messages);

		expect(messages.length).toBeGreaterThanOrEqual(3);
		for (const message of messages) {
			expect(message.message).toContain('{@attach}');
			expect(message.message).toContain('on()');
			expect(message.message).toContain('svelte/events');
		}
		expect(lines.some((line) => line.includes('registerControlId(controlSource, idProp)'))).toBe(
			true
		);
		expect(lines.some((line) => line.includes("addEventListener('wheel'"))).toBe(true);
		expect(lines.some((line) => line.includes('removePointerUp?.()'))).toBe(true);
	});

	it('allows on() and register cleanup from the same attachment', async () => {
		const { source, messages } = await messagesFor('split-lifecycle.pass.svelte', ruleName);
		expect(source).toContain("from 'svelte/events'");
		expect(source).toContain('return () => labelable.registerControlId');
		expect(source).toContain('return motion.observeViewportSize()');
		expect(messages).toEqual([]);
	});
});

describe('sveltery/no-previous-value-effect', () => {
	const ruleName = 'no-previous-value-effect';

	it('rejects skip-first and previous-value effects', async () => {
		const { source, messages } = await messagesFor('previous-value.fail.svelte', ruleName);
		const lines = reportedLines(source, messages);

		expect(messages.length).toBeGreaterThanOrEqual(4);
		for (const message of messages) {
			expect(message.message).toContain('previous value');
			expect(message.message).toContain('commits the value');
		}
		expect(lines.some((line) => line.includes('sawChecked'))).toBe(true);
		expect(lines.some((line) => line.includes('sawControlledValue'))).toBe(true);
		expect(lines.some((line) => line.includes('lastKey'))).toBe(true);
		expect(lines.some((line) => line.includes('sawValue'))).toBe(true);
	});

	it('allows the side effect on the commit path', async () => {
		const { source, messages } = await messagesFor('previous-value.pass.svelte', ruleName);
		expect(source).toContain('formContext.clearErrors(name)');
		expect(source).toContain('field.change(next)');
		expect(messages).toEqual([]);
	});
});

describe('sveltery/no-process-env', () => {
	const ruleName = 'no-process-env';

	it('rejects process.env and globalThis.process', async () => {
		const { source, messages } = await messagesFor('process-env.fail.svelte', ruleName);
		const lines = reportedLines(source, messages);

		expect(messages.length).toBeGreaterThanOrEqual(2);
		for (const message of messages) {
			expect(message.message).toContain('DEV');
			expect(message.message).toContain('esm-env');
		}
		expect(lines.some((line) => line.includes('globalThis'))).toBe(true);
		expect(lines.some((line) => line.includes('NODE_ENV'))).toBe(true);
	});

	it('allows DEV from esm-env', async () => {
		const { source, messages } = await messagesFor('process-env.pass.svelte', ruleName);
		expect(source).toContain("from 'esm-env'");
		expect(source).toContain('if (!DEV)');
		expect(messages).toEqual([]);
	});
});

describe('project config', () => {
	it('enforces the effect rules under src/', async () => {
		const eslint = new ESLint({ cwd: fileURLToPath(root) });
		const sample = [
			'let seenWrites = 0;',
			'let seenValue = 0;',
			'$effect.pre(() => {',
			'	seenWrites = seenValue;',
			'});'
		].join('\n');
		const [library] = await eslint.lintText(sample, { filePath: 'src/lib/probe.ts' });
		const ids = (library?.messages ?? []).map((message) => message.ruleId);
		expect(ids).toContain('sveltery/no-prop-state-sync');
	});
});
