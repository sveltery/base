import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import QuestionnaireCollectionHarness from '../../tests/QuestionnaireCollectionHarness.svelte';

vi.mock('esm-env', () => ({ BROWSER: true, DEV: false, NODE: false }));

let instance: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (instance) await unmount(instance);
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

it('prints no collection warnings in production', () => {
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	instance = mount(QuestionnaireCollectionHarness, {
		target: document.body,
		props: { scenario: 'mismatch' }
	});
	flushSync();
	expect(document.querySelector('input')?.getAttribute('name')).toBe('answer');
	expect(warn.mock.calls).toEqual([]);
});
