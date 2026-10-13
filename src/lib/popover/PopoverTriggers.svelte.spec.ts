// Assertions follow Base UI v1.9.0 packages/react/src/popover/**/*.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverTriggersHarness from '../../tests/PopoverTriggersHarness.svelte';
import type { PopoverChangeEventDetails } from './index.js';

function recordOpenChanges() {
	const calls: [boolean, string | null][] = [];
	const onOpenChange = vi.fn((open: boolean, details: PopoverChangeEventDetails) => {
		calls.push([open, details.reason]);
	});
	return { calls, onOpenChange };
}

function content() {
	return document.querySelector('[data-testid="content"]')?.textContent ?? null;
}

describe('shadow DOM', () => {
	it('switches triggers without a focus-out close when pressing inside a trigger’s shadow root', async () => {
		const { calls, onOpenChange } = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [
				{ id: 'trigger-1', label: 'Trigger 1', payload: 1 },
				{ id: 'trigger-2', label: 'Trigger 2', payload: 2, shadowHost: true }
			],
			onOpenChange
		});
		const host = page.getByTestId('shadow-host-trigger-2').element();
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';

		await page.getByRole('button', { name: 'Trigger 1' }).click();
		await expect.element(page.getByTestId('input-inside')).toHaveFocus();

		await page.getByTestId('shadow-inner').click();
		await expect.poll(content).toBe('2');
		expect(calls).toEqual([
			[true, 'trigger-press'],
			[true, 'trigger-press']
		]);
	});
});
