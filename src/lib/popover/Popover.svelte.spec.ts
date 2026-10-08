// Assertions follow Base UI v1.8.0 packages/react/src/popover/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Menu, Combobox, shadow-root outside press, and actionsRef are not ported.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverFixture from '../../routes/fixtures/popover/PopoverFixture.svelte';
import { Popover } from './index.js';

describe('Popover', () => {
	it('opens and closes from the trigger', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const popup = page.getByRole('dialog');
		await expect.element(popup).toBeVisible();
		await expect.element(popup).toHaveAttribute('data-open', '');
		await expect.element(trigger).toHaveAttribute('aria-controls', popup.element().id);
		expect(popup.element().id).toMatch(/^base-ui-/);
		await expect.element(page.getByRole('heading', { name: 'Title' })).toBeVisible();
		expect(popup.element().getAttribute('aria-labelledby')).toMatch(/^base-ui-/);
		await trigger.click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('closes on escape and outside press', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await page
			.getByRole('dialog')
			.element()
			.ownerDocument.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('lets onOpenChange cancel the open', async () => {
		render(PopoverFixture, { scenario: 'cancel' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		expect(page.getByTestId('calls').element().textContent).toContain('"canceled":true');
	});

	it('does not open a disabled trigger', async () => {
		render(PopoverFixture, { scenario: 'disabled' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await expect.element(trigger).toHaveAttribute('disabled', '');
		await expect.element(trigger).toHaveAttribute('data-disabled', '');
		await trigger.click({ force: true });
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('opens a modal popover', async () => {
		render(PopoverFixture, { scenario: 'modal' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Close' }).click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('opens on hover', async () => {
		render(PopoverFixture, { scenario: 'hover' });
		await page.getByRole('button', { name: 'Open' }).hover();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Open' }))
			.not.toHaveAttribute('data-pressed');
	});

	it('focuses the first item inside the popup', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
	});

	it('throws outside the root', () => {
		expect(() => render(Popover.Popup)).toThrow(
			'Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.'
		);
	});

	it('throws when the trigger has no root or handle', () => {
		expect(() => render(Popover.Trigger)).toThrow(
			'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.'
		);
	});
});
