import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESLint, type Linter } from 'eslint';
import ts from 'typescript-eslint';
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
				files: ['**/*.ts'],
				plugins: { sveltery: plugin as unknown as Linter.Plugin },
				languageOptions: {
					parser: ts.parser,
					ecmaVersion: 'latest',
					sourceType: 'module'
				},
				rules: { 'sveltery/no-cloned-event': 'error' }
			}
		]
	});
}

async function messages(code: string) {
	const eslint = eslintFor();
	const [result] = await eslint.lintText(code, { filePath: repoPath('src/lib/slider/example.ts') });
	return (result?.messages ?? []).map((message) => message.message);
}

describe('sveltery/no-cloned-event', () => {
	it('rejects a cloned event and a replaced target', async () => {
		const cloned = await messages(
			'const copy = new event.constructor(event.type, event);\nvoid copy;\n'
		);
		expect(cloned.some((message) => message.includes('original event'))).toBe(true);

		const target = await messages(
			"Object.defineProperty(event, 'target', { value: { value: 1, name: 'volume' } });\n"
		);
		expect(target.some((message) => message.includes('original event'))).toBe(true);
	});

	it('rejects the constructor alias the slider used to clone events', async () => {
		const removed =
			await messages(`function cloneEventWithTarget(event: Event, value: number, name: string | undefined) {
	const EventConstructor = event.constructor as typeof Event;
	const clonedEvent = new EventConstructor(event.type, event);
	Object.defineProperty(clonedEvent, 'target', {
		writable: true,
		value: { value, name }
	});
	return clonedEvent;
}
`);
		expect(removed.some((message) => message.includes('original event'))).toBe(true);
	});

	it('rejects a destructured constructor and Reflect.construct', async () => {
		const destructured = await messages(
			'const { constructor: C } = event;\nconst copy = new C(event.type, event);\nvoid copy;\n'
		);
		expect(destructured.some((message) => message.includes('original event'))).toBe(true);

		const reflected = await messages(
			'const copy = Reflect.construct(event.constructor, [event.type, event]);\nvoid copy;\n'
		);
		expect(reflected.some((message) => message.includes('original event'))).toBe(true);
	});

	it('allows a native event constructor and a real target read', async () => {
		const native = await messages(
			"input.dispatchEvent(new Event('change', { bubbles: true }));\nconst node = event.target;\nvoid node;\n"
		);
		expect(native).toEqual([]);
	});
});
