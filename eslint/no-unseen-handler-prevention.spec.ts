import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
import plugin from './plugin.js';

const require = createRequire(import.meta.url);
const svelteParser = createRequire(require.resolve('eslint-plugin-svelte'))(
	'svelte-eslint-parser'
) as Linter.Parser;

const ruleId = 'sveltery/no-unseen-handler-prevention';

async function lines(script: string) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files: ['**/*.svelte'],
				languageOptions: {
					parser: svelteParser,
					parserOptions: { ecmaVersion: 'latest', sourceType: 'module', parser: ts.parser }
				},
				plugins: { sveltery: plugin },
				rules: { [ruleId]: 'error' }
			}
		]
	});
	const [result] = await eslint.lintText(`<script lang="ts">${script}</script>`, {
		filePath: 'src/lib/part/Part.svelte'
	});
	return (result?.messages ?? [])
		.filter((message) => message.ruleId === ruleId)
		.map((message) => message.line);
}

describe('sveltery/no-unseen-handler-prevention', () => {
	it('rejects a defaultPrevented read after a consumer handler for an event that cannot be canceled', async () => {
		const found = await lines(`
			let { onfocus, onload, ...props } = $props();
			function handleFocus(event: FocusEvent) {
				onfocus?.(event);
				if (event.defaultPrevented) return;
			}
			function handleLoad(event: Event) {
				onload.call(this, event);
				if (event.defaultPrevented) return;
			}
			function handleBlur(event: FocusEvent) {
				props.onblur?.(event);
				if (event.defaultPrevented) return;
			}
		`);
		expect(found).toEqual([5, 9, 13]);
	});

	it('accepts a cancelable event, a read before the call, and chain()', async () => {
		const found = await lines(`
			import { chain } from '../internal/mergeProps.js';
			let { onclick, onfocus, onkeydown } = $props();
			function handleClick(event: MouseEvent) {
				onclick?.(event);
				if (event.defaultPrevented) return;
			}
			function handleFocus(event: FocusEvent) {
				if (event.defaultPrevented) return;
				onfocus?.(event);
			}
			function handleKeyDown(event: KeyboardEvent) {
				if (!event.defaultPrevented) return;
			}
			const props = { onkeydown: chain(handleKeyDown, onkeydown), onfocus: chain(handleFocus, onfocus) };
		`);
		expect(found).toEqual([]);
	});
});
