import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DetachedFieldHarness from '../../tests/DetachedFieldHarness.svelte';

describe('DEFAULT_FIELD_ROOT_CONTEXT', () => {
	it('detaches a control from the surrounding Field.Root when set as the field context', async () => {
		render(DetachedFieldHarness);

		const attached = page.getByTestId('attached');
		await expect.element(attached).toHaveAttribute('name', 'email');
		await expect.element(attached).toHaveAttribute('aria-invalid', 'true');
		const detached = page.getByTestId('detached');
		await expect.element(detached).not.toHaveAttribute('name');
		await expect.element(detached).not.toHaveAttribute('aria-invalid');
	});
});
