import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;

const ruleId = 'sveltery/no-unscoped-timer';
const base = '90994ba84434f172f80c6c90b1acfbc395c89d2a';

const preFixPaths = [
	'src/lib/internal/floating-ui-react/hooks/useClick.svelte.ts',
	'src/lib/internal/floating-ui-react/hooks/useDismiss.svelte.ts',
	'src/lib/internal/floating-ui-react/hooks/useHoverFloatingInteraction.svelte.ts',
	'src/lib/internal/floating-ui-react/hooks/useHoverInteractionSharedState.svelte.ts',
	'src/lib/internal/floating-ui-react/safePolygon.ts',
	'src/lib/internal/floating-ui-react/components/FloatingFocusManager.svelte',
	'src/lib/scroll-area/model.svelte.ts',
	'src/lib/popover/PopoverViewport.svelte',
	'src/lib/popover/store.svelte.ts',
	'src/lib/internal/useScrollLock.svelte.ts',
	'src/lib/internal/popups/popupHandle.svelte.ts',
	'src/lib/internal/useTransitionStatus.svelte.ts'
];

function lint(code: string, filePath: string) {
	const svelte = filePath.endsWith('.svelte');
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files: ['**/*.{ts,js,svelte}'],
				languageOptions: {
					parser: svelte ? svelteParser : ts.parser,
					parserOptions: {
						ecmaVersion: 'latest',
						sourceType: 'module',
						extraFileExtensions: ['.svelte'],
						parser: ts.parser
					}
				},
				plugins: { sveltery: plugin },
				rules: { [ruleId]: 'error' }
			}
		]
	});
	return eslint.lintText(code, { filePath });
}

async function messagesFor(code: string, filePath: string) {
	const [result] = await lint(code, filePath);
	return (result?.messages ?? []).filter((message) => message.ruleId === ruleId);
}

function show(path: string) {
	return execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8' });
}

describe('sveltery/no-unscoped-timer', () => {
	it('rejects construction, create(), and aliases', async () => {
		const code = `
			import { AnimationFrame, Timeout } from './timeout.js';
			const Clock = Timeout;
			const make = AnimationFrame.create;
			const { create } = Timeout;
			const frame = new AnimationFrame();
			const clock = new Clock();
			Timeout.create();
			make();
			create();
		`;
		const messages = await messagesFor(
			code,
			'src/lib/internal/floating-ui-react/hooks/useClick.svelte.ts'
		);
		expect(messages).toHaveLength(5);
	});

	it('allows the class module, the scoped factory, and specs', async () => {
		const code = `
			export class Timeout { static create() { return new Timeout(); } }
			const clock = new Timeout();
			Timeout.create();
		`;
		expect(await messagesFor(code, 'src/lib/internal/timeout.ts')).toHaveLength(0);
		expect(await messagesFor(code, 'src/lib/internal/timeout.svelte.ts')).toHaveLength(0);
		expect(await messagesFor(code, 'src/lib/internal/timeout.spec.ts')).toHaveLength(0);
	});

	it('rejects the unscoped timers on main', async () => {
		const hits: { path: string; lines: number[] }[] = [];
		for (const path of preFixPaths) {
			const messages = await messagesFor(show(path), path);
			expect(messages.length, path).toBeGreaterThan(0);
			hits.push({
				path,
				lines: messages.map((message: Linter.LintMessage) => message.line ?? 0)
			});
		}
		expect(hits.map((hit) => hit.path)).toEqual(preFixPaths);
	});
});
