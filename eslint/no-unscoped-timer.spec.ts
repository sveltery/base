import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;

const ruleId = 'sveltery/no-unscoped-timer';

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
			'packages/floating-ui-svelte/src/hooks/useClick.svelte.ts'
		);
		expect(messages).toHaveLength(5);
	});

	it('rejects a namespace import and raw platform timers', async () => {
		const code = `
			import * as timers from './timeout.js';
			const clock = new timers.Timeout();
			timers.AnimationFrame.create();
			setTimeout(() => {}, 0);
			globalThis.requestAnimationFrame(() => {});
		`;
		const messages = await messagesFor(code, 'src/lib/avatar/fallback-timer.ts');
		expect(messages).toHaveLength(4);
	});

	it('rejects setInterval and AnimationFrame.request', async () => {
		const code = `
			import { AnimationFrame } from './timeout.js';
			setInterval(() => {}, 0);
			AnimationFrame.request(() => {});
		`;
		const messages = await messagesFor(code, 'src/lib/internal/usePressAndHold.svelte.ts');
		expect(messages).toHaveLength(2);
	});

	it('rejects AnimationFrame.request in the focus manager', async () => {
		const code = `<script>
			import { AnimationFrame } from './timeout.js';
			AnimationFrame.request(() => {});
		</script>`;
		const manager = 'packages/floating-ui-svelte/src/components/FloatingFocusManager.svelte';
		expect(await messagesFor(code, manager)).toHaveLength(1);
	});

	it('allows the class module, the scoped factory, and specs', async () => {
		const code = `
			export class Timeout { static create() { return new Timeout(); } }
			const clock = new Timeout();
			Timeout.create();
		`;
		expect(await messagesFor(code, 'packages/utils/src/timeout.ts')).toHaveLength(0);
		expect(await messagesFor(code, 'packages/utils/src/timeout.svelte.ts')).toHaveLength(0);
		expect(await messagesFor(code, 'packages/utils/src/timeout.spec.ts')).toHaveLength(0);
	});
});
