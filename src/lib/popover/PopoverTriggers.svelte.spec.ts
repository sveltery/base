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

describe('focus manager', () => {
	it('closes on the outside press, not on focus out, when another popover’s trigger is pressed inside its shadow root', async () => {
		const first = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'first', label: 'First', payload: 1 }],
			onOpenChange: first.onOpenChange
		});
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'second', label: 'Second', payload: 2, shadowHost: true }],
			inside: false
		});
		const host = page.getByTestId('shadow-host-second').element();
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';

		await page.getByRole('button', { name: 'First' }).click();
		await expect.element(page.getByTestId('input-inside')).toHaveFocus();

		await page.getByTestId('shadow-inner').click();
		await expect.poll(() => first.calls.length).toBe(2);
		expect(first.calls).toEqual([
			[true, 'trigger-press'],
			[false, 'outside-press']
		]);
	});
});

describe('hover', () => {
	it('stays open after leaving when a nested popup trigger was pressed inside its shadow root', async () => {
		const { calls, onOpenChange } = recordOpenChanges();
		render(PopoverTriggersHarness, {
			triggers: [{ id: 'trigger-1', label: 'Trigger 1', payload: 1, openOnHover: true }],
			before: true,
			onOpenChange
		});
		await page.getByRole('button', { name: 'Trigger 1' }).hover();
		await expect.element(page.getByTestId('popup')).toBeVisible();
		const nested = document.createElement('button');
		nested.setAttribute('aria-haspopup', 'menu');
		const host = document.createElement('span');
		nested.append(host);
		host.attachShadow({ mode: 'open' }).innerHTML = '<b data-testid="shadow-inner">Inner</b>';
		page.getByTestId('popup').element().append(nested);

		await page.getByTestId('shadow-inner').click();
		await page.getByTestId('before').hover();
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(calls).toEqual([[true, 'trigger-hover']]);
		await expect.element(page.getByTestId('popup')).toBeVisible();
	});
});
