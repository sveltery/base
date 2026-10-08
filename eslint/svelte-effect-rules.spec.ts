import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import { compile } from 'svelte/compiler';
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

function covers(source: string, messages: Linter.LintMessage[], snippet: string) {
	const lineNo = source.split('\n').findIndex((line) => line.includes(snippet)) + 1;
	return messages.some((message) => {
		const start = message.line ?? 0;
		const end = message.endLine ?? start;
		return lineNo >= start && lineNo <= end;
	});
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
		expect(lines.some((line) => line.includes('refreshRoot(style, dir)'))).toBe(true);
		expect(lines.some((line) => line.includes('sync(disabledState)'))).toBe(true);
		expect(lines.some((line) => line.includes('publish(actions)'))).toBe(true);
		expect(lines.some((line) => line.includes('const _height = height'))).toBe(true);
		expect(lines.some((line) => line.includes('const itemDisabled = disabled'))).toBe(true);
		expect(lines.some((line) => line.includes('const nativeDisabled ='))).toBe(true);
	});

	it('rejects always-true conditions, identical branches, and comparison counters', async () => {
		const { source, messages } = await messagesFor('forced-read.fail.svelte', ruleName);

		expect(messages.length).toBeGreaterThanOrEqual(4);
		expect(messages.some((message) => message.message.includes('always-true'))).toBe(true);
		expect(messages.some((message) => message.message.includes('identical branches'))).toBe(true);
		expect(messages.some((message) => message.message.includes('comparison counter'))).toBe(true);
		expect(covers(source, messages, 'height !== undefined || width !== undefined')).toBe(true);
		expect(covers(source, messages, 'untrack(() => ensureActive())')).toBe(true);
		expect(covers(source, messages, 'untrack(() => reconcile())')).toBe(true);
		expect(covers(source, messages, 'readStyle() !== style')).toBe(true);
	});

	it('rejects the same forced reads when they live in a helper', async () => {
		const { messages } = await messagesFor('history/210a2daf-forced-read.fail.svelte', ruleName);
		expect(messages.length).toBeGreaterThanOrEqual(6);
	});

	it('allows a measured size, a disabled item, and one direction check', async () => {
		const { source, messages } = await messagesFor('forced-read.pass.svelte', ruleName);
		expect(source).toContain('height === undefined && width === undefined');
		expect(source).toContain('keepEnabled(item)');
		expect(source).toContain('direction !== seen');
		expect(messages).toEqual([]);
	});

	it('allows passing signals into a function and publishing a bindable by assignment', async () => {
		const { source, messages } = await messagesFor('void-signal.pass.svelte', ruleName);
		expect(source).toContain('syncAfter(disabledState, focusableWhenDisabled)');
		expect(source).toContain('$derived.by');
		expect(source).toContain('actions = actionsHandle');
		expect(source).not.toContain('$effect.pre');
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
		expect(lines.some((line) => line.includes('prior'))).toBe(true);
		expect(lines.some((line) => line.includes('previousElementSibling'))).toBe(false);
	});

	it('allows the side effect on the commit path', async () => {
		const { source, messages } = await messagesFor('previous-value.pass.svelte', ruleName);
		expect(source).toContain('formContext.clearErrors(name)');
		expect(source).toContain('field.change(next)');
		expect(source).toContain('node.previousElementSibling');
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

const ruleNames = Object.keys(plugin.rules);

const failRuleByFile: Record<string, string> = {
	'derived-inline-attachment.fail.svelte': 'sveltery/no-derived-inline-attachment',
	'derived-const-arrow.fail.svelte': 'sveltery/no-derived-inline-attachment',
	'inline-composite-keys.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-arrows.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-concat.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-equals.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-object.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-regex.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-split.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-split-comma.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-spread.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-switch.fail.svelte': 'sveltery/no-inline-composite-keys',
	'inline-composite-keys-template.fail.svelte': 'sveltery/no-inline-composite-keys',
	'prop-state-sync.fail.svelte': 'sveltery/no-prop-state-sync',
	'void-signal.fail.svelte': 'sveltery/no-void-signal-read',
	'split-lifecycle.fail.svelte': 'sveltery/no-split-effect-lifecycle',
	'previous-value.fail.svelte': 'sveltery/no-previous-value-effect',
	'process-env.fail.svelte': 'sveltery/no-process-env',
	'form-ref-current.fail.svelte': 'sveltery/no-react-refs',
	'forced-read.fail.svelte': 'sveltery/no-void-signal-read'
};

function lintWithEveryRule(code: string, filePath: string) {
	const rules = Object.fromEntries(ruleNames.map((name) => [`sveltery/${name}`, 'error']));
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

describe('fixtures', () => {
	const fixtureNames = readdirSync(new URL('eslint/fixtures/', root)).filter((name) =>
		name.endsWith('.svelte')
	);

	it('compiles every fixture', () => {
		for (const name of fixtureNames) {
			const source = readFileSync(new URL(`eslint/fixtures/${name}`, root), 'utf8');
			expect(() => compile(source, { filename: name, generate: 'client' }), name).not.toThrow();
		}
	});

	it('runs every rule over every fixture', async () => {
		for (const name of fixtureNames) {
			const source = readFileSync(new URL(`eslint/fixtures/${name}`, root), 'utf8');
			const [result] = await lintWithEveryRule(source, name);
			const messages = (result?.messages ?? []).filter((message) =>
				message.ruleId?.startsWith('sveltery/')
			);
			if (name.endsWith('.pass.svelte')) {
				expect(messages, name).toEqual([]);
				continue;
			}
			const ruleId = failRuleByFile[name];
			expect(ruleId, name).toBeTruthy();
			expect(
				messages.some((message) => message.ruleId === ruleId),
				name
			).toBe(true);
		}
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
