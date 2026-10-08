import { readFileSync } from 'node:fs';
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

	it('rejects the pre-fix popover helpers and allows the shared imports', async () => {
		const copied = readFileSync(repoPath('eslint/fixtures/popover-pre-fix-helpers.js'), 'utf8');
		const failures = await messages(copied, 'src/lib/popover/pre-fix-helpers.ts');
		expect(failures.some((message) => message.includes('useButton.ts'))).toBe(true);
		expect(failures.some((message) => message.includes('adaptiveOriginMiddleware.ts'))).toBe(true);
		expect(failures.some((message) => message.includes('popupStoreUtils.ts'))).toBe(true);
		expect(failures.some((message) => message.includes('src/lib/popover/handle.svelte.ts'))).toBe(
			true
		);
		expect(failures.some((message) => message.includes('labelId.ts'))).toBe(true);

		const cleaned = await messages(
			[
				"import { useButton } from '../internal/useButton.js';",
				"import { adaptiveOriginMiddleware } from '../internal/adaptiveOriginMiddleware.js';",
				"import { resolveFocus } from '../internal/popups/popupStoreUtils.js';",
				"import { PopoverHandle } from './handle.svelte.js';",
				'void useButton;',
				'void adaptiveOriginMiddleware;',
				'void resolveFocus;',
				'void PopoverHandle;'
			].join('\n'),
			'src/lib/popover/cleaned-helpers.ts'
		);
		expect(cleaned).toEqual([]);
	});
});
