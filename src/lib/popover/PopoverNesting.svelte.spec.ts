// Assertions follow Base UI v1.9.0 packages/react/src/popover/root/PopoverRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { mount, unmount } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverNestingHarness from '../../tests/PopoverNestingHarness.svelte';

const popoverPopup = () => page.getByTestId('popover-popup');

describe('nested menu interactions', () => {
	it('keeps the popover open when a nested menu opens via Enter using a shared container', async () => {
		render(PopoverNestingHarness, { nested: 'menu' });

		(page.getByRole('button', { name: 'Toggle' }).element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(popoverPopup()).toBeInTheDocument();

		const nestedTrigger = page.getByRole('button', { name: 'Open nested' });
		await expect.element(nestedTrigger).toBeInTheDocument();
		(nestedTrigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(page.getByTestId('menu-popup')).toBeInTheDocument();

		await expect.element(popoverPopup()).toBeInTheDocument();
	});

	it('keeps the popover open when a nested menu opens via pointer using a shared container', async () => {
		render(PopoverNestingHarness, { nested: 'menu' });

		await userEvent.click(page.getByRole('button', { name: 'Toggle' }));
		await expect.element(popoverPopup()).toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Open nested' }));
		await expect.element(page.getByTestId('menu-popup')).toBeInTheDocument();

		await userEvent.click(page.getByText('Item'));

		await expect.element(popoverPopup()).toBeInTheDocument();
		await expect.element(page.getByTestId('menu-popup')).toBeInTheDocument();
	});
});

describe('nested combobox', () => {
	async function openCombobox() {
		render(PopoverNestingHarness, { nested: 'combobox' });
		const input = page.getByTestId('combobox-input');
		await expect.element(input).toHaveFocus();

		await userEvent.click(input);

		await expect.element(page.getByRole('listbox')).toBeVisible();
	}

	it('closes a nested combobox popup when tabbing out of the popover', async () => {
		await openCombobox();

		await userEvent.tab();

		await expect.element(page.getByTestId('focus-target')).toHaveFocus();
		await expect.element(popoverPopup()).toHaveAttribute('data-closed');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});

	it('closes a nested combobox popup when tabbing backward to the trigger', async () => {
		await openCombobox();
		const trigger = page.getByTestId('trigger');
		await expect.element(trigger).not.toHaveAttribute('aria-hidden', 'true');

		await userEvent.tab({ shift: true });

		await expect.element(trigger).toHaveFocus();
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});
});

describe('closing via outside press in a shadow root', () => {
	function renderInShadowRoot() {
		const host = document.body.appendChild(document.createElement('div'));
		const shadowRoot = host.attachShadow({ mode: 'open' });
		const target = shadowRoot.appendChild(document.createElement('div'));
		const onOpenChange = vi.fn();
		const mounted = mount(PopoverNestingHarness, {
			target,
			props: { nested: 'none', container: shadowRoot, onOpenChange }
		});
		onTestFinished(async () => {
			await unmount(mounted);
			host.remove();
		});
		return { shadowRoot, onOpenChange };
	}

	it('works when clicking another element inside the same shadow root', async () => {
		const { shadowRoot, onOpenChange } = renderInShadowRoot();
		await expect.poll(() => shadowRoot.querySelector('[role="dialog"]')).not.toBeNull();

		shadowRoot.querySelector<HTMLElement>('[data-testid="outside"]')!.click();

		await expect.poll(() => shadowRoot.querySelector('[role="dialog"]')).toBeNull();
		expect(
			onOpenChange.mock.calls.map(([open, details]) => [open, details.reason, details.trigger])
		).toEqual([[false, 'outside-press', undefined]]);
	});

	it('works when clicking outside the shadow root', async () => {
		const { shadowRoot, onOpenChange } = renderInShadowRoot();
		await expect.poll(() => shadowRoot.querySelector('[role="dialog"]')).not.toBeNull();

		document.body.click();

		await expect.poll(() => shadowRoot.querySelector('[role="dialog"]')).toBeNull();
		expect(
			onOpenChange.mock.calls.map(([open, details]) => [open, details.reason, details.trigger])
		).toEqual([[false, 'outside-press', undefined]]);
	});
});
