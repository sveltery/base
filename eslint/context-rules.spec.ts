import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import plugin from './plugin.js';

const root = new URL('..', import.meta.url);

function repoPath(relativePath: string) {
	return fileURLToPath(new URL(relativePath, root));
}

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
			repoPath('src/lib/slider/dom.ts')
		);
		expect(direction.some((message) => message.includes('useDirection()'))).toBe(true);

		const foreign = await messages(
			"import { useScrollAreaContext } from '../scroll-area/context.svelte.js';\n",
			repoPath('src/lib/slider/example.ts')
		);
		expect(foreign.some((message) => message.includes('context module'))).toBe(true);
	});

	it('rejects a computed direction read on library code and allows a spec', async () => {
		const helper = await messages(
			'export const rtl = getComputedStyle(element).direction;\n',
			repoPath('src/lib/slider/model.svelte.ts')
		);
		expect(helper.some((message) => message.includes('useDirection()'))).toBe(true);

		const spec = await messages(
			'expect(getComputedStyle(node).direction).toBe("rtl");\n',
			repoPath('src/lib/slider/Slider.svelte.spec.ts')
		);
		expect(spec).toEqual([]);

		const field = await messages(
			"import { useFieldContext } from '../field/context.svelte.js';\n",
			repoPath('src/lib/slider/example.ts')
		);
		expect(field).toEqual([]);
	});
});
