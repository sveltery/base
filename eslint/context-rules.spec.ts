import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import plugin from './plugin.js';

function eslintFor(files: string[]) {
	return new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files,
				plugins: { sveltery: plugin as unknown as Linter.Plugin },
				languageOptions: {
					ecmaVersion: 'latest',
					sourceType: 'module'
				},
				rules: {
					'sveltery/no-computed-style-direction': 'error',
					'sveltery/no-foreign-context': 'error'
				}
			}
		]
	});
}

async function messages(code: string, filePath: string) {
	const eslint = eslintFor(['**/*.ts', '**/*.js']);
	const [result] = await eslint.lintText(code, { filePath });
	return (result?.messages ?? []).map((message) => message.message);
}

describe('context rules', () => {
	it('rejects a computed direction read and a foreign context import', async () => {
		const direction = await messages(
			'const rtl = getComputedStyle(element).direction === "rtl";\n',
			'/workspace/src/lib/slider/dom.ts'
		);
		expect(direction.some((message) => message.includes('useDirection()'))).toBe(true);

		const foreign = await messages(
			"import { useScrollAreaContext } from '../scroll-area/context.svelte.js';\n",
			'/workspace/src/lib/slider/example.ts'
		);
		expect(foreign.some((message) => message.includes('context module'))).toBe(true);
	});

	it('allows the internal helper, a spec, and a shared field context', async () => {
		const helper = await messages(
			'export const rtl = getComputedStyle(element).direction;\n',
			'/workspace/src/lib/internal/text-direction.ts'
		);
		expect(helper).toEqual([]);

		const spec = await messages(
			'expect(getComputedStyle(node).direction).toBe("rtl");\n',
			'/workspace/src/lib/slider/Slider.svelte.spec.ts'
		);
		expect(spec).toEqual([]);

		const field = await messages(
			"import { useFieldContext } from '../field/context.svelte.js';\n",
			'/workspace/src/lib/slider/example.ts'
		);
		expect(field).toEqual([]);
	});
});
