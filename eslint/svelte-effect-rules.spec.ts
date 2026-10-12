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

describe('sveltery/no-layout-read-in-derived', () => {
	const ruleName = 'no-layout-read-in-derived';

	it('rejects layout reads in $derived, including one followed call', async () => {
		const direct = await messagesFor('layout-read.fail.svelte', ruleName);
		const imported = await messagesFor('layout-read-import.fail.svelte', ruleName);
		const owner = await messagesFor('layout-read-owner.fail.svelte', ruleName);
		const destructured = await messagesFor('layout-read-destructure.fail.svelte', ruleName);
		const byName = await messagesFor('layout-read-by-name.fail.svelte', ruleName);

		expect(covers(direct.source, direct.messages, 'return box(el)')).toBe(true);
		expect(covers(direct.source, direct.messages, 'el.getBoundingClientRect()')).toBe(true);
		expect(covers(imported.source, imported.messages, 'measure(el)')).toBe(true);
		expect(covers(owner.source, owner.messages, 'ownerWindow(el).getComputedStyle(el)')).toBe(true);
		expect(covers(destructured.source, destructured.messages, 'const { offsetWidth } = el')).toBe(
			true
		);
		expect(covers(byName.source, byName.messages, '$derived.by(compute)')).toBe(true);
		for (const messages of [
			direct.messages,
			imported.messages,
			owner.messages,
			destructured.messages,
			byName.messages
		]) {
			expect(messages.length).toBeGreaterThan(0);
			for (const message of messages) expect(message.message).toContain('ResizeObserver');
		}
	});

	it('allows a layout read in an effect', async () => {
		const { source, messages } = await messagesFor('layout-read.pass.svelte', ruleName);
		expect(source).toContain('getBoundingClientRect()');
		expect(messages).toEqual([]);
	});

	it('resolves a nested fixture path instead of the basename at the fixtures root', async () => {
		const { messages } = await messagesFor('nested/layout-read-nested.fail.svelte', ruleName);
		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0]?.message).toContain('ResizeObserver');
	});

	it('does not bind a missing path to a fixture that only shares the basename', async () => {
		const source = readFileSync(
			new URL('eslint/fixtures/layout-read-import.fail.svelte', root),
			'utf8'
		);
		const filePath = new URL('tmp-not-fixture/layout-read-import.fail.svelte', root).pathname;
		const [result] = await lintWithRule(source, filePath, ruleName);
		expect(ruleMessages(result, `sveltery/${ruleName}`)).toEqual([]);
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
		expect(lines.some((line) => line.includes('this.directionBaseline = current'))).toBe(true);
		expect(lines.some((line) => line.includes('this.saved = next'))).toBe(true);
		expect(lines.some((line) => line.includes('previousElementSibling'))).toBe(false);
	});

	it('allows the side effect on the commit path', async () => {
		const { source, messages } = await messagesFor('previous-value.pass.svelte', ruleName);
		expect(source).toContain('formContext.clearErrors(name)');
		expect(source).toContain('field.change(next)');
		expect(source).toContain('node.previousElementSibling');
		expect(source).toContain('comesBeforeInSameTree(control, firstControl)');
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
	'prop-state-sync.fail.svelte': 'sveltery/no-prop-state-sync',
	'split-lifecycle.fail.svelte': 'sveltery/no-split-effect-lifecycle',
	'previous-value.fail.svelte': 'sveltery/no-previous-value-effect',
	'process-env.fail.svelte': 'sveltery/no-process-env',
	'form-ref-current.fail.svelte': 'sveltery/no-react-refs',
	'state-updater.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-alias.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-typeof.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-renamed.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-named.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-notequal.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-instanceof.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-call.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-local.fail.svelte': 'sveltery/no-state-updater',
	'state-updater-inline.fail.svelte': 'sveltery/no-state-updater',
	'imperative-handle.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-alias.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-pre.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-shorthand.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-bind.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-factory.fail.svelte': 'sveltery/no-react-refs',
	'imperative-handle-pre-shorthand.fail.svelte': 'sveltery/no-react-refs',
	'previous-value-same.fail.svelte': 'sveltery/no-previous-value-effect',
	'previous-value-names.fail.svelte': 'sveltery/no-previous-value-effect',
	'previous-value-cross.fail.svelte': 'sveltery/no-previous-value-effect',
	'previous-value-fn.fail.svelte': 'sveltery/no-previous-value-effect',
	'previous-value-context.fail.svelte': 'sveltery/no-previous-value-effect',
	'layout-read.fail.svelte': 'sveltery/no-layout-read-in-derived',
	'layout-read-destructure.fail.svelte': 'sveltery/no-layout-read-in-derived',
	'layout-read-import.fail.svelte': 'sveltery/no-layout-read-in-derived',
	'layout-read-owner.fail.svelte': 'sveltery/no-layout-read-in-derived',
	'layout-read-by-name.fail.svelte': 'sveltery/no-layout-read-in-derived'
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
			const filePath = source.includes("from './") ? `eslint/fixtures/${name}` : name;
			const [result] = await lintWithEveryRule(source, filePath);
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
