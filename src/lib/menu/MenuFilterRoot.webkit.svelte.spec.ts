// Assertions follow Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.webkit.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Kept in its own file so the platform mock does not reach the other menu specs.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuFilterWebkitHarness from '../../tests/menu/MenuFilterWebkitHarness.svelte';

vi.mock('@sveltery/utils', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@sveltery/utils')>();
	return {
		...actual,
		platform: {
			...actual.platform,
			engine: { ...actual.platform.engine, webkit: true }
		}
	};
});

function input(name = 'Filter actions') {
	return page.getByRole('searchbox', { name }).element() as HTMLInputElement;
}

function queryInput(name = 'Filter actions') {
	return document.querySelector<HTMLInputElement>(`input[aria-label="${name}"]`);
}

function item(name: string, role = 'menuitem') {
	return page.getByRole(role as 'menuitem', { name, exact: true }).element() as HTMLElement;
}

describe('<Menu.FilterProvider><Menu.Root/></Menu.FilterProvider> (WebKit)', () => {
	it('marks only the highlighted item while its input is focused in WebKit', async () => {
		render(MenuFilterWebkitHarness);
		await expect.poll(() => document.activeElement).toBe(input());

		const apple = item('Apple');
		const banana = item('Banana');
		expect(apple.getAttribute('aria-selected')).toBe(null);

		await userEvent.keyboard('{ArrowDown}');
		expect(apple.getAttribute('aria-selected')).toBe('true');
		expect(banana.getAttribute('aria-selected')).toBe(null);
		expect(input().getAttribute('aria-activedescendant')).toBe(apple.id);

		await userEvent.keyboard('{ArrowDown}');
		expect(apple.getAttribute('aria-selected')).toBe(null);
		expect(banana.getAttribute('aria-selected')).toBe('true');

		input().blur();
		await expect.poll(() => banana.getAttribute('aria-selected')).toBe(null);

		input().focus();
		await expect.poll(() => banana.getAttribute('aria-selected')).toBe('true');
	});

	// Upstream renders this one in Strict Mode, which has no Svelte counterpart.
	it('keeps selection state for an auto-focused input', async () => {
		render(MenuFilterWebkitHarness, { autofocus: true });
		await expect.poll(() => document.activeElement).toBe(input());

		await userEvent.keyboard('{ArrowDown}');
		expect(item('Apple').getAttribute('aria-selected')).toBe('true');
	});

	it('keeps selection state when a focused input is replaced', async () => {
		const view = render(MenuFilterWebkitHarness, { autofocus: true, inputKey: 'first' });
		const first = input();
		await expect.poll(() => document.activeElement).toBe(first);

		await view.rerender({ inputKey: 'second' });
		await expect.poll(() => queryInput()).not.toBe(first);
		const replacement = input();
		await expect.poll(() => document.activeElement).toBe(replacement);

		await userEvent.keyboard('{ArrowDown}');
		expect(item('Apple').getAttribute('aria-selected')).toBe('true');
	});

	it('keeps selection in sync when a focused input is replaced without autofocus', async () => {
		const view = render(MenuFilterWebkitHarness, { autofocus: true, inputKey: 'first' });
		const first = input();
		await expect.poll(() => document.activeElement).toBe(first);
		await userEvent.keyboard('{ArrowDown}');
		const apple = item('Apple');
		expect(apple.getAttribute('aria-selected')).toBe('true');

		await view.rerender({ inputKey: 'second', autofocus: false });
		await expect.poll(() => queryInput()).not.toBe(first);
		const replacement = input();
		// Engines differ in whether they restore focus after removing the old input.
		expect(apple.getAttribute('aria-selected')).toBe(replacement.matches(':focus') ? 'true' : null);
	});

	it('clears selection when the focused input unmounts while the menu stays open', async () => {
		const view = render(MenuFilterWebkitHarness, { autofocus: true });
		await expect.poll(() => document.activeElement).toBe(input());
		await userEvent.keyboard('{ArrowDown}');
		const apple = item('Apple');
		expect(apple.getAttribute('aria-selected')).toBe('true');

		await view.rerender({ showInput: false });
		expect(queryInput()).toBe(null);
		expect(apple.isConnected).toBe(true);
		expect(apple.getAttribute('aria-selected')).toBe(null);
	});

	it('does not restore selection after a focused input unmounts and the menu reopens on hover', async () => {
		const view = render(MenuFilterWebkitHarness, { scenario: 'hover' });
		await expect.poll(() => document.activeElement).toBe(input());
		expect(item('Apple').getAttribute('aria-selected')).toBe('true');

		await view.rerender({ close: true });
		await expect.poll(() => queryInput()).toBe(null);

		await userEvent.hover(page.getByRole('button', { name: 'Actions' }).element());
		await expect.poll(() => queryInput()).not.toBe(null);
		expect(document.activeElement).not.toBe(input());
		expect(item('Apple').getAttribute('aria-selected')).toBe(null);
	});

	it('preserves checked state on checkbox and radio items in WebKit', async () => {
		render(MenuFilterWebkitHarness, { scenario: 'checked' });
		const checkbox = item('Details', 'menuitemcheckbox');
		const radio = item('Date', 'menuitemradio');
		await expect.poll(() => document.activeElement).toBe(input());

		await userEvent.keyboard('{ArrowDown}');
		expect(checkbox.getAttribute('aria-selected')).toBe('true');
		expect(checkbox.getAttribute('aria-checked')).toBe('true');

		await userEvent.keyboard('{ArrowDown}');
		expect(radio.getAttribute('aria-selected')).toBe('true');
		expect(radio.getAttribute('aria-checked')).toBe('true');
	});

	it('marks highlighted links and submenu triggers while their input is focused in WebKit', async () => {
		render(MenuFilterWebkitHarness, { scenario: 'triggers' });
		const link = item('Documentation');
		const submenuTrigger = item('More actions');
		const plainSubmenuTrigger = item('Plain submenu');
		await expect.poll(() => document.activeElement).toBe(input());

		await userEvent.keyboard('{ArrowDown}');
		expect(link.getAttribute('aria-selected')).toBe('true');
		expect(submenuTrigger.getAttribute('aria-selected')).toBe(null);
		expect(input().getAttribute('aria-activedescendant')).toBe(link.id);

		await userEvent.keyboard('{ArrowDown}');
		expect(link.getAttribute('aria-selected')).toBe(null);
		expect(submenuTrigger.getAttribute('aria-selected')).toBe('true');
		expect(input().getAttribute('aria-activedescendant')).toBe(submenuTrigger.id);

		expect(plainSubmenuTrigger.getAttribute('aria-selected')).toBe(null);
		await userEvent.keyboard('{ArrowDown}');

		expect(submenuTrigger.getAttribute('aria-selected')).toBe(null);
		expect(plainSubmenuTrigger.getAttribute('aria-selected')).toBe('true');
		expect(input().getAttribute('aria-activedescendant')).toBe(plainSubmenuTrigger.id);
	});

	it('marks items inside an opened submenu while its input is focused', async () => {
		render(MenuFilterWebkitHarness, { scenario: 'submenu-input' });
		await expect.poll(() => document.activeElement).toBe(input());
		await userEvent.keyboard('{ArrowDown}{ArrowRight}');

		await expect.poll(() => queryInput('Filter more actions')).not.toBe(null);
		const submenuInput = input('Filter more actions');
		await expect.poll(() => document.activeElement).toBe(submenuInput);

		const shareItem = item('Share');
		const submenuTrigger = item('More actions');
		expect(submenuTrigger.getAttribute('aria-selected')).toBe(null);
		expect(shareItem.getAttribute('aria-selected')).toBe('true');

		await userEvent.keyboard('{ArrowUp}');
		expect(shareItem.getAttribute('aria-selected')).toBe(null);

		await userEvent.keyboard('{ArrowDown}');
		expect(shareItem.getAttribute('aria-selected')).toBe('true');
		expect(submenuInput.getAttribute('aria-activedescendant')).toBe(shareItem.id);
	});

	it('leaves plain menu items alone, which navigate with real focus', async () => {
		render(MenuFilterWebkitHarness, { scenario: 'plain' });
		await expect.poll(() => document.querySelector('[role="menuitem"]')).not.toBe(null);
		expect(item('Apple').getAttribute('aria-selected')).toBe(null);
	});
});
