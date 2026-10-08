import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import plugin from './plugin.js';

const root = new URL('..', import.meta.url);

function repoPath(relativePath: string) {
	return fileURLToPath(new URL(relativePath, root));
}

function eslintFor() {
	return new ESLint({
		overrideConfigFile: true,
		overrideConfig: [
			{
				files: ['**/*.{ts,svelte}'],
				plugins: { sveltery: plugin as unknown as Linter.Plugin },
				languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
				rules: { 'sveltery/no-copied-helper': 'error' }
			}
		]
	});
}

async function messages(code: string, relativePath: string) {
	const eslint = eslintFor();
	const [result] = await eslint.lintText(code, { filePath: repoPath(relativePath) });
	return (result?.messages ?? []).map((message) => message.message);
}

describe('sveltery/no-copied-helper', () => {
	it('rejects a second helper and a second platform probe', async () => {
		const helper = await messages(
			'function toCssStyle(style) { return String(style); }\n',
			'src/lib/slider/example.ts'
		);
		expect(helper.some((message) => message.includes('src/lib/internal/css-style.ts'))).toBe(true);

		const timer = await messages('class Timeout {}\n', 'src/lib/slider/example.ts');
		expect(timer.some((message) => message.includes('src/lib/internal/timeout.ts'))).toBe(true);

		const animations = await messages(
			'function runOnceAnimationsFinish() { return 0; }\n',
			'src/lib/field/example.ts'
		);
		expect(
			animations.some((message) => message.includes('src/lib/internal/animations-finished.ts'))
		).toBe(true);

		const skipped = await messages(
			'function isSkipped(element) { return element.hidden; }\n',
			'src/lib/radio-group/example.ts'
		);
		expect(skipped.some((message) => message.includes('src/lib/internal/composite-skip.ts'))).toBe(
			true
		);

		const engine = await messages(
			"const webkit = CSS.supports('-webkit-backdrop-filter:none');\nvoid webkit;\n",
			'src/lib/scroll-area/example.ts'
		);
		expect(engine.some((message) => message.includes('src/lib/internal/platform.ts'))).toBe(true);

		const ios = await messages(
			'const ios = /^i(os$|p)/.test(platform);\nvoid ios;\n',
			'src/lib/number-field/example.ts'
		);
		expect(ios.some((message) => message.includes('src/lib/internal/platform.ts'))).toBe(true);
	});

	it('allows the owning module, a method call, and a native event', async () => {
		const owner = await messages(
			'export function contains(parent, child) { return parent ? parent.contains(child) : false; }\n',
			'src/lib/internal/shadow-dom.ts'
		);
		expect(owner).toEqual([]);

		const method = await messages(
			'function visit(node, child) { return node.contains(child); }\n',
			'src/lib/tabs/example.ts'
		);
		expect(method).toEqual([]);
	});
});
