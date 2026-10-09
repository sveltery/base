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

	it('rejects a stored computed style and getPropertyValue', async () => {
		const stored = await messages(
			'const style = getComputedStyle(element);\nconst dir = style.direction;\n',
			repoPath('src/lib/slider/example.ts')
		);
		expect(stored.some((message) => message.includes('useDirection()'))).toBe(true);

		const property = await messages(
			"const dir = getComputedStyle(element).getPropertyValue('direction');\n",
			repoPath('src/lib/slider/example.ts')
		);
		expect(property.some((message) => message.includes('useDirection()'))).toBe(true);

		const storedProperty = await messages(
			"const style = getComputedStyle(element);\nconst dir = style.getPropertyValue('direction');\n",
			repoPath('src/lib/slider/example.ts')
		);
		expect(storedProperty.some((message) => message.includes('useDirection()'))).toBe(true);
	});

	it('rejects the seven context folders from a component that does not read them', async () => {
		const sources = [
			"import { useFieldContext } from '../field/context.svelte.js';\n",
			"import { useFormContext } from '../form/context.js';\n",
			"import { useFieldsetRootContext } from '../fieldset/context.svelte.js';\n",
			"import { useCollapsibleRootContext } from '../collapsible/context.svelte.js';\n",
			"import { useToggleGroupContext } from '../toggle-group/context.svelte.js';\n",
			"import { useRadioContext } from '../radio/context.js';\n",
			"import { useCheckboxContext } from '../checkbox/context.js';\n"
		];
		for (const source of sources) {
			const result = await messages(source, repoPath('src/lib/dialog/example.ts'));
			expect(
				result.some((message) => message.includes('context module')),
				source
			).toBe(true);
		}
	});

	it('rejects input importing form context outside a spec', async () => {
		const source = "import { unprovidedFormFieldCount } from '../form/context.js';\n";
		const component = await messages(source, repoPath('src/lib/input/example.ts'));
		expect(component.some((message) => message.includes('context module'))).toBe(true);
		const spec = await messages(source, repoPath('src/lib/input/Input.svelte.spec.ts'));
		expect(spec).toEqual([]);
	});
});
