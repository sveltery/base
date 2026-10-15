// Assertions follow Base UI v1.9.0 packages/react/src/menu/{trigger,item,link-item,group,
// group-label,checkbox-item,checkbox-item-indicator,radio-group,radio-item,
// radio-item-indicator,popup,backdrop,positioner,arrow,viewport,portal}/*.test.tsx (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
import { createRawSnippet, tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuHarness from '../../tests/menu/MenuHarness.svelte';
import MenuAnchorHarness from '../../tests/menu/MenuAnchorHarness.svelte';
import MenuFocusHarness from '../../tests/menu/MenuFocusHarness.svelte';
import MenuToolbarHarness from '../../tests/menu/MenuToolbarHarness.svelte';
import MenuGroupHarness from '../../tests/menu/MenuGroupHarness.svelte';
import MenuOrphan from '../../tests/menu/MenuOrphan.svelte';
import { enterWithMouse, mouse } from '../../tests/menu/mouse.js';
import { items } from '../../tests/menu/types.js';
import { inOneTypeaheadRun } from '../../tests/menu/typeahead.js';

function menus() {
	return [...document.querySelectorAll('[role="menu"]')];
}

function trigger(name = 'Open') {
	return page.getByRole('button', { name }).element() as HTMLElement;
}

function item(name: string) {
	return page.getByRole('menuitem', { name, exact: true }).element() as HTMLElement;
}

function key(target: Element, type: 'keydown' | 'keyup', value: string) {
	target.dispatchEvent(new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true }));
}

function checkbox(name = 'Item') {
	return page.getByRole('menuitemcheckbox', { name, exact: true }).element() as HTMLElement;
}

function radio(name: string) {
	return page.getByRole('menuitemradio', { name, exact: true }).element() as HTMLElement;
}

async function settle() {
	await tick();
	await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	await tick();
}

describe('Menu.Trigger', () => {
	it('throws without Menu.Root or a handle', () => {
		expect(() => render(MenuOrphan, { part: 'trigger' })).toThrow(
			'Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.'
		);
	});

	it('renders a disabled button that does not open the menu', async () => {
		render(MenuHarness, { trigger: { disabled: true }, items: items('One') });
		expect(trigger()).toHaveProperty('disabled', true);
		await userEvent.click(trigger(), { force: true });
		await settle();
		expect(menus()).toEqual([]);
	});

	for (const [buttonType, key] of [
		['native', 'ArrowUp'],
		['native', 'ArrowDown'],
		['non-native', 'ArrowUp'],
		['non-native', 'ArrowDown'],
		['non-native', 'Enter'],
		['non-native', ' ']
	] as const) {
		it(`opens the menu when pressing ${JSON.stringify(key)} on a ${buttonType} button`, async () => {
			render(MenuHarness, {
				triggerAs: buttonType === 'native' ? 'button' : 'span',
				items: items('1')
			});
			const button = trigger();
			expect(button.tagName).toBe(buttonType === 'native' ? 'BUTTON' : 'SPAN');
			button.focus();
			await userEvent.keyboard(key === ' ' ? '[Space]' : `[${key}]`);
			await expect.poll(() => menus().length).toBe(1);
		});
	}

	it('sets data-popup-open and data-pressed while open', async () => {
		render(MenuHarness, { items: items('One') });
		trigger().click();
		await settle();
		expect(trigger().hasAttribute('data-popup-open')).toBe(true);
		expect(trigger().hasAttribute('data-pressed')).toBe(true);
	});

	it('keeps data-popup-open when a controlled close is vetoed', async () => {
		let open = $state(false);
		render(MenuHarness, {
			get open() {
				return open;
			},
			rootProps: {
				onOpenChange(next: boolean, details: { cancel(): void }) {
					if (next) open = true;
					else details.cancel();
				}
			},
			items: items('Item')
		});
		await userEvent.click(trigger());
		await expect.poll(() => menus().length).toBe(1);
		expect(trigger().hasAttribute('data-popup-open')).toBe(true);
		// The modal backdrop takes the press.
		await userEvent.click(page.getByRole('button', { name: 'Outside' }), { force: true });
		await settle();
		expect(menus()[0]?.hasAttribute('data-open')).toBe(true);
		expect(trigger().hasAttribute('data-popup-open')).toBe(true);
	});

	it('keeps a hover-opened menu open when mouseup lands within the trigger bounds', async () => {
		render(MenuHarness, {
			trigger: { openOnHover: true, delay: 0, style: 'width: 120px; height: 40px; display: block' },
			items: items('One')
		});
		await userEvent.hover(trigger());
		await expect.poll(() => menus().length).toBe(1);
		const rect = trigger().getBoundingClientRect();
		document.body.dispatchEvent(
			new MouseEvent('mouseup', {
				bubbles: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2
			})
		);
		await settle();
		expect(menus().length).toBe(1);
	});

	it('does not open with the mouse when onmousedown prevents the default', async () => {
		render(MenuHarness, {
			trigger: { onmousedown: (event: MouseEvent) => event.preventDefault() },
			items: items('One')
		});
		await userEvent.click(trigger());
		await settle();
		expect(menus()).toEqual([]);
	});

	it('does not open with the keyboard when onclick prevents the default', async () => {
		render(MenuHarness, {
			trigger: { onclick: (event: MouseEvent) => event.preventDefault() },
			items: items('One')
		});
		trigger().focus();
		await userEvent.keyboard('[Enter]');
		await settle();
		expect(menus()).toEqual([]);
	});

	it('gives a non-native trigger the button role', async () => {
		render(MenuHarness, { triggerAs: 'span', items: items('One') });
		expect(trigger().getAttribute('role')).toBe('button');
	});

	it('does not set a role on a native trigger', async () => {
		render(MenuHarness, { items: items('One') });
		expect(trigger().hasAttribute('role')).toBe(false);
	});

	it('closes the menu when tabbing backward from the open trigger', async () => {
		render(MenuHarness, { before: true, items: items('Item') });
		await userEvent.click(trigger());
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menu');
		trigger().focus();
		expect(trigger().getAttribute('aria-expanded')).toBe('true');
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.poll(() => document.activeElement?.textContent).toBe('Before');
		await expect.poll(() => menus().length).toBe(0);
	});

	it('removes the hover mouseup listener when unmounted before mouseup', async () => {
		const add = vi.spyOn(document, 'addEventListener');
		const remove = vi.spyOn(document, 'removeEventListener');
		try {
			const view = render(MenuHarness, {
				trigger: { openOnHover: true, delay: 0 },
				items: items('One')
			});
			add.mockClear();
			enterWithMouse(trigger());
			await expect.poll(() => menus().length).toBe(1);
			const listener = add.mock.calls.find((call) => call[0] === 'mouseup')?.[1];
			expect(listener).toBeTypeOf('function');
			view.unmount();
			expect(remove.mock.calls.some((call) => call[0] === 'mouseup' && call[1] === listener)).toBe(
				true
			);
		} finally {
			add.mockRestore();
			remove.mockRestore();
		}
	});

	describe('impatient clicks with openOnHover', () => {
		const PATIENT_CLICK_THRESHOLD = 500;

		async function advance(ms: number) {
			await vi.advanceTimersByTimeAsync(ms);
			await tick();
		}

		function isOpen() {
			return trigger().hasAttribute('data-popup-open');
		}

		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('does not close the menu if the user clicks too quickly', async () => {
			render(MenuHarness, { trigger: { openOnHover: true, delay: 0 }, items: items('One') });
			mouse(trigger(), 'mousemove');
			await advance(PATIENT_CLICK_THRESHOLD - 1);
			mouse(trigger(), 'click');
			await advance(0);
			expect(isOpen()).toBe(true);
		});

		it('closes the menu if the user clicks patiently', async () => {
			render(MenuHarness, { trigger: { openOnHover: true, delay: 0 }, items: items('One') });
			mouse(trigger(), 'mouseenter', { bubbles: false });
			await advance(PATIENT_CLICK_THRESHOLD);
			mouse(trigger(), 'click');
			await advance(0);
			expect(isOpen()).toBe(false);
			mouse(trigger(), 'mouseleave', { bubbles: false });
			await advance(0);
			expect(isOpen()).toBe(false);
		});

		it('sticks if the user clicks impatiently', async () => {
			render(MenuHarness, { trigger: { openOnHover: true, delay: 0 }, items: items('One') });
			mouse(trigger(), 'mouseenter', { bubbles: false });
			await advance(PATIENT_CLICK_THRESHOLD - 1);
			mouse(trigger(), 'click');
			mouse(trigger(), 'mouseleave', { bubbles: false });
			await advance(0);
			expect(isOpen()).toBe(true);
			await advance(1);
			expect(isOpen()).toBe(true);
		});

		it('sticks when clicked before the hover delay completes', async () => {
			render(MenuHarness, { trigger: { openOnHover: true, delay: 300 }, items: items('One') });
			mouse(trigger(), 'mouseenter', { bubbles: false });
			mouse(trigger(), 'mousemove');
			await advance(100);
			mouse(trigger(), 'click');
			await advance(0);
			expect(isOpen()).toBe(true);
			mouse(trigger(), 'mouseleave', { bubbles: false });
			await advance(0);
			expect(isOpen()).toBe(true);
		});

		it('keeps the menu open when re-hovered and clicked within the patient threshold', async () => {
			render(MenuHarness, { trigger: { openOnHover: true, delay: 100 }, items: items('One') });
			mouse(trigger(), 'mouseenter', { bubbles: false });
			mouse(trigger(), 'mousemove');
			await advance(100);
			expect(menus().length).toBe(1);
			await advance(PATIENT_CLICK_THRESHOLD);
			mouse(trigger(), 'mouseleave', { bubbles: false });
			mouse(trigger(), 'mouseenter', { bubbles: false });
			mouse(trigger(), 'mousemove');
			mouse(trigger(), 'click');
			await advance(0);
			expect(menus().length).toBe(1);
		});
	});
});

describe('Menu.Item', () => {
	it('throws outside Menu.Root', () => {
		expect(() => render(MenuOrphan, { part: 'item' })).toThrow(
			'Base UI: MenuRootContext is missing. Menu parts must be placed within <Menu.Root>.'
		);
	});

	it('calls onclick when clicked', async () => {
		const onclick = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [{ type: 'item', label: 'Item', props: { onclick } }]
		});
		await userEvent.click(item('Item'));
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('does not close the menu when onclick prevents the default', async () => {
		const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
		render(MenuHarness, { items: [{ type: 'item', label: 'Item', props: { onclick } }] });
		await userEvent.click(trigger());
		await userEvent.click(item('Item'));
		await settle();
		expect(onclick).toHaveBeenCalledTimes(1);
		expect(menus().length).toBe(1);
	});

	it('closes the menu on click by default', async () => {
		render(MenuHarness, { items: items('Item') });
		await userEvent.click(trigger());
		await userEvent.click(item('Item'));
		await expect.poll(() => menus().length).toBe(0);
	});

	it('keeps the menu open on click with closeOnClick false', async () => {
		render(MenuHarness, {
			items: [{ type: 'item', label: 'Item', props: { closeOnClick: false } }]
		});
		await userEvent.click(trigger());
		await userEvent.click(item('Item'));
		await settle();
		expect(menus().length).toBe(1);
	});

	it('can be focused but not activated when disabled', async () => {
		const onclick = vi.fn();
		const onkeydown = vi.fn();
		const onkeyup = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{ type: 'item', label: 'Item', props: { disabled: true, onclick, onkeydown, onkeyup } }
			]
		});
		const node = item('Item');
		node.focus();
		expect(document.activeElement).toBe(node);
		expect(node.getAttribute('aria-disabled')).toBe('true');
		expect(node.hasAttribute('data-disabled')).toBe(true);
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		node.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
		node.click();
		expect(onkeydown).not.toHaveBeenCalled();
		expect(onkeyup).not.toHaveBeenCalled();
		expect(onclick).not.toHaveBeenCalled();
	});

	it('skips a natively disabled item during keyboard navigation', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{ type: 'item', label: '1' },
				{ type: 'item', label: '2', as: 'button', props: { buttonProps: { disabled: true } } },
				{ type: 'item', label: '3' }
			]
		});
		const [first, , last] = page.getByRole('menuitem').elements() as HTMLElement[];
		first.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(last);
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => document.activeElement).toBe(first);
	});
});

describe('Menu.LinkItem', () => {
	it('renders an anchor with the menuitem role', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [{ type: 'link', label: 'Docs', props: { href: '#docs' } }]
		});
		const link = item('Docs');
		expect(link.tagName).toBe('A');
		expect(link.getAttribute('href')).toBe('#docs');
	});

	it('follows the link with Enter and Space', async () => {
		history.replaceState(null, '', '#start');
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{ type: 'link', label: 'link 1', props: { href: '#one' } },
				{ type: 'link', label: 'link 2', props: { href: '#two' } }
			]
		});
		item('link 2').focus();
		await userEvent.keyboard('[Enter]');
		await expect.poll(() => location.hash).toBe('#two');
		item('link 1').focus();
		await userEvent.keyboard('[Space]');
		await expect.poll(() => location.hash).toBe('#one');
		history.replaceState(null, '', location.pathname + location.search);
	});

	it('does not follow the link when Space is pressed during typeahead', async () => {
		history.replaceState(null, '', '#start');
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{ type: 'link', label: 'Item One', props: { href: '#one' } },
				{ type: 'link', label: 'Item Two', props: { href: '#two' } }
			]
		});
		item('Item One').focus();
		await inOneTypeaheadRun(async () => {
			await userEvent.keyboard('Item T');
			await expect.poll(() => document.activeElement).toBe(item('Item Two'));
			await userEvent.keyboard('[Space]');
			await settle();
		});
		expect(location.hash).toBe('#start');
		history.replaceState(null, '', location.pathname + location.search);
	});
});

describe('Menu.Group and Menu.GroupLabel', () => {
	it('renders a group', async () => {
		render(MenuGroupHarness, { labels: 'one' });
		expect(page.getByRole('group').element().tagName).toBe('DIV');
	});

	it('throws outside Menu.Group or Menu.RadioGroup', () => {
		expect(() => render(MenuOrphan, { part: 'group-label' })).toThrow(
			'Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.'
		);
	});

	it('hides the label from the accessibility tree by default', async () => {
		render(MenuGroupHarness, { labels: 'one' });
		expect(page.getByText('Test group').element().getAttribute('aria-hidden')).toBe('true');
	});

	it('lets the consumer override aria-hidden', async () => {
		render(MenuGroupHarness, { labels: 'one', labelProps: { 'aria-hidden': undefined } });
		expect(page.getByText('Test group').element().hasAttribute('aria-hidden')).toBe(false);
	});

	for (const radio of [false, true]) {
		const name = radio ? 'RadioGroup' : 'Group';
		it(`references the generated label id in the ${name} aria-labelledby`, async () => {
			render(MenuGroupHarness, { labels: 'one', radio });
			const label = page.getByText('Test group').element();
			expect(label.id).not.toBe('');
			expect(page.getByRole('group').element().getAttribute('aria-labelledby')).toBe(label.id);
		});

		it(`references the provided label id in the ${name} aria-labelledby`, async () => {
			render(MenuGroupHarness, { labels: 'one', radio, labelProps: { id: 'test-group' } });
			expect(page.getByRole('group').element().getAttribute('aria-labelledby')).toBe('test-group');
		});
	}

	it('does not let an older label cleanup clear a newer label', async () => {
		const view = render(MenuGroupHarness, { labels: 'old' });
		const group = page.getByRole('group').element();
		expect(group.getAttribute('aria-labelledby')).toBe('old-label');
		await view.rerender({ labels: 'both' });
		expect(group.getAttribute('aria-labelledby')).toBe('new-label');
		await view.rerender({ labels: 'new' });
		expect(group.getAttribute('aria-labelledby')).toBe('new-label');
	});
});

describe('Menu.CheckboxItem', () => {
	for (const [checked, ariaChecked, dataState] of [
		[true, 'true', 'checked'],
		[false, 'false', 'unchecked']
	] as const) {
		it(`sets the state and ARIA attributes when checked is ${checked}`, async () => {
			render(MenuHarness, { items: [{ type: 'checkbox', label: 'Item', props: { checked } }] });
			await userEvent.click(trigger());
			expect(checkbox().getAttribute('aria-checked')).toBe(ariaChecked);
			expect(checkbox().getAttribute(`data-${dataState}`)).toBe('');
		});
	}

	it('toggles the checked state when clicked', async () => {
		render(MenuHarness, { items: [{ type: 'checkbox', label: 'Item' }] });
		await userEvent.click(trigger());
		await userEvent.click(checkbox());
		expect(checkbox().getAttribute('aria-checked')).toBe('true');
		expect(checkbox().hasAttribute('data-checked')).toBe(true);
		await userEvent.click(checkbox());
		expect(checkbox().getAttribute('aria-checked')).toBe('false');
		expect(checkbox().hasAttribute('data-unchecked')).toBe(true);
	});

	for (const pressed of ['Space', 'Enter']) {
		it(`toggles the checked state when ${pressed} is pressed`, async () => {
			render(MenuHarness, { items: [{ type: 'checkbox', label: 'Item' }] });
			trigger().focus();
			await userEvent.keyboard('[ArrowDown]');
			await expect.poll(() => document.activeElement).toBe(checkbox());
			await userEvent.keyboard(`[${pressed}]`);
			expect(checkbox().hasAttribute('data-checked')).toBe(true);
			if (pressed === 'Space') {
				await userEvent.keyboard('[Space]');
				expect(checkbox().hasAttribute('data-unchecked')).toBe(true);
			}
		});
	}

	it('toggles with Space after closing during typeahead and reopening', async () => {
		render(MenuHarness, { items: [{ type: 'checkbox', label: 'Settings' }] });
		trigger().focus();
		await userEvent.keyboard('[Enter]');
		await expect.poll(() => document.activeElement).toBe(checkbox('Settings'));
		await userEvent.keyboard('s[Escape]');
		await expect.poll(() => document.activeElement).toBe(trigger());
		await userEvent.keyboard('[Enter]');
		await expect.poll(() => document.activeElement).toBe(checkbox('Settings'));
		expect(checkbox('Settings').getAttribute('aria-checked')).toBe('false');
		await userEvent.keyboard('[Space]');
		expect(checkbox('Settings').getAttribute('aria-checked')).toBe('true');
	});

	it('does not toggle when Space is pressed during typeahead', async () => {
		const onCheckedChange = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{ type: 'checkbox', label: 'Item One', props: { onCheckedChange } },
				{ type: 'checkbox', label: 'Item Two', props: { onCheckedChange } }
			]
		});
		checkbox('Item One').focus();
		await inOneTypeaheadRun(async () => {
			await userEvent.keyboard('Item T');
			await expect.poll(() => document.activeElement).toBe(checkbox('Item Two'));
			await userEvent.keyboard('[Space]');
			await userEvent.keyboard('[Space]');
		});
		expect(onCheckedChange).not.toHaveBeenCalled();
		expect(checkbox('Item Two').getAttribute('aria-checked')).toBe('false');
	});

	it('calls onCheckedChange with the next value', async () => {
		const onCheckedChange = vi.fn();
		render(MenuHarness, {
			items: [{ type: 'checkbox', label: 'Item', props: { onCheckedChange } }]
		});
		await userEvent.click(trigger());
		await userEvent.click(checkbox());
		expect(onCheckedChange).toHaveBeenCalledTimes(1);
		expect(onCheckedChange.mock.lastCall?.[0]).toBe(true);
		expect(onCheckedChange.mock.lastCall?.[1].reason).toBe('item-press');
		await userEvent.click(checkbox());
		expect(onCheckedChange).toHaveBeenCalledTimes(2);
		expect(onCheckedChange.mock.lastCall?.[0]).toBe(false);
	});

	it('does not toggle when onCheckedChange cancels', async () => {
		render(MenuHarness, {
			items: [
				{
					type: 'checkbox',
					label: 'Item',
					props: { onCheckedChange: (_: boolean, details: { cancel(): void }) => details.cancel() }
				}
			]
		});
		await userEvent.click(trigger());
		await userEvent.click(checkbox());
		expect(checkbox().getAttribute('aria-checked')).toBe('false');
		expect(checkbox().hasAttribute('data-checked')).toBe(false);
	});

	it('keeps the state when closed and reopened', async () => {
		render(MenuHarness, {
			rootProps: { modal: false },
			portalProps: { keepMounted: true },
			items: [{ type: 'checkbox', label: 'Item' }]
		});
		trigger().focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.click(checkbox());
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('{Enter}');
		expect(checkbox().getAttribute('aria-checked')).toBe('true');
		expect(checkbox().hasAttribute('data-checked')).toBe(true);
	});

	it('closes the menu on click with closeOnClick', async () => {
		const calls: [string, boolean, string][] = [];
		render(MenuHarness, {
			rootProps: {
				onOpenChange: (open: boolean, details: { reason: string }) =>
					calls.push(['onOpenChange', open, details.reason])
			},
			portalProps: { keepMounted: true },
			items: [
				{
					type: 'checkbox',
					label: 'Item',
					props: {
						closeOnClick: true,
						onCheckedChange: (checked: boolean, details: { reason: string }) =>
							calls.push(['onCheckedChange', checked, details.reason])
					}
				}
			]
		});
		await userEvent.click(trigger());
		await userEvent.click(checkbox());
		await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('false');
		const item = document.querySelector('[role="menuitemcheckbox"]')!;
		expect(item.getAttribute('aria-checked')).toBe('true');
		expect(item.hasAttribute('data-checked')).toBe(true);
		expect(calls).toEqual([
			['onOpenChange', true, 'trigger-press'],
			['onCheckedChange', true, 'item-press'],
			['onOpenChange', false, 'item-press']
		]);
	});

	it('keeps the menu open on click by default', async () => {
		render(MenuHarness, { items: [{ type: 'checkbox', label: 'Item' }] });
		await userEvent.click(trigger());
		await userEvent.click(checkbox());
		await settle();
		expect(menus().length).toBe(1);
	});

	it('can be focused but not activated when disabled', async () => {
		const onCheckedChange = vi.fn();
		const onclick = vi.fn();
		const onkeydown = vi.fn();
		const onkeyup = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{
					type: 'checkbox',
					label: 'Item',
					props: { disabled: true, onCheckedChange, onclick, onkeydown, onkeyup }
				}
			]
		});
		const node = checkbox();
		node.focus();
		expect(document.activeElement).toBe(node);
		key(node, 'keydown', 'Enter');
		key(node, 'keyup', ' ');
		node.click();
		expect(onkeydown).not.toHaveBeenCalled();
		expect(onkeyup).not.toHaveBeenCalled();
		expect(onclick).not.toHaveBeenCalled();
		expect(onCheckedChange).not.toHaveBeenCalled();
	});
});

describe('Menu.CheckboxItemIndicator', () => {
	it('throws outside Menu.CheckboxItem', () => {
		expect(() => render(MenuOrphan, { part: 'checkbox-indicator' })).toThrow(
			'Base UI: MenuCheckboxItemContext is missing. MenuCheckboxItem parts must be placed within <Menu.CheckboxItem>.'
		);
	});

	it('renders a hidden span with the item state', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{
					type: 'checkbox',
					label: 'Item',
					props: { checked: true },
					indicator: { 'data-testid': 'indicator' }
				}
			]
		});
		const indicator = page.getByTestId('indicator').element();
		expect(indicator.tagName).toBe('SPAN');
		expect(indicator.getAttribute('aria-hidden')).toBe('true');
		expect(indicator.hasAttribute('data-checked')).toBe(true);
	});

	it('removes the indicator when there is no exit animation', async () => {
		const spec = (checked: boolean) => ({
			open: true,
			trigger: false as const,
			rootProps: { modal: false },
			items: [
				{
					type: 'checkbox' as const,
					label: 'Item',
					props: { checked },
					indicator: { 'data-testid': 'indicator' }
				}
			]
		});
		const view = render(MenuHarness, spec(true));
		expect(document.querySelector('[data-testid="indicator"]')).not.toBeNull();
		await view.rerender(spec(false));
		await expect.poll(() => document.querySelector('[data-testid="indicator"]')).toBeNull();
	});

	it('keeps the indicator mounted while its exit animation plays', async () => {
		const style = document.createElement('style');
		style.textContent =
			'@keyframes menu-indicator-out { to { opacity: 0; } } .menu-indicator[data-ending-style] { animation: menu-indicator-out 50ms; }';
		document.head.append(style);
		try {
			const spec = (checked: boolean) => ({
				open: true,
				trigger: false as const,
				rootProps: { modal: false },
				items: [
					{
						type: 'checkbox' as const,
						label: 'Item',
						props: { checked },
						indicator: { 'data-testid': 'indicator', class: 'menu-indicator' }
					}
				]
			});
			const view = render(MenuHarness, spec(true));
			await view.rerender(spec(false));
			await expect
				.poll(() =>
					document.querySelector('[data-testid="indicator"]')?.hasAttribute('data-ending-style')
				)
				.toBe(true);
			await expect.poll(() => document.querySelector('[data-testid="indicator"]')).toBeNull();
		} finally {
			style.remove();
		}
	});

	it('keeps the element with keepMounted after the exit animation', async () => {
		const spec = (checked: boolean) => ({
			open: true,
			trigger: false as const,
			rootProps: { modal: false },
			items: [
				{
					type: 'checkbox' as const,
					label: 'Item',
					props: { checked },
					indicator: { 'data-testid': 'indicator', keepMounted: true }
				}
			]
		});
		const view = render(MenuHarness, spec(true));
		await view.rerender(spec(false));
		await settle();
		const indicator = document.querySelector('[data-testid="indicator"]');
		expect(indicator?.hasAttribute('data-unchecked')).toBe(true);
	});
});

describe('Menu.RadioGroup and Menu.RadioItem', () => {
	function group(props: Record<string, unknown> = {}, itemProps: Record<string, unknown>[] = []) {
		return [
			{
				type: 'radio-group' as const,
				props: { value: 0, ...props },
				items: [
					{ label: 'one', value: 'one', props: itemProps[0] },
					{ label: 'two', value: 'two', props: itemProps[1] }
				]
			}
		];
	}

	it('renders a group with the disabled state', async () => {
		render(MenuHarness, { open: true, trigger: false, items: group({ disabled: true }) });
		const node = page.getByRole('group').element();
		expect(node.getAttribute('aria-disabled')).toBe('true');
		expect(node.getAttribute('data-disabled')).toBe('');
	});

	it('omits the disabled state from an enabled group', async () => {
		render(MenuHarness, { open: true, trigger: false, items: group() });
		const node = page.getByRole('group').element();
		expect(node.getAttribute('aria-disabled')).toBe(null);
		expect(node.getAttribute('data-disabled')).toBe(null);
	});

	it('throws a radio item outside Menu.RadioGroup', () => {
		expect(() => render(MenuOrphan, { part: 'radio-item' })).toThrow(
			'Base UI: MenuRadioGroupContext is missing. MenuRadioGroup parts must be placed within <Menu.RadioGroup>.'
		);
	});

	it('sets the state and ARIA attributes when selected', async () => {
		render(MenuHarness, { items: group() });
		await userEvent.click(trigger());
		expect(radio('one').getAttribute('aria-checked')).toBe('false');
		expect(radio('one').hasAttribute('data-unchecked')).toBe(true);
		await userEvent.click(radio('one'));
		expect(radio('one').getAttribute('aria-checked')).toBe('true');
		expect(radio('one').hasAttribute('data-checked')).toBe(true);
	});

	for (const pressed of ['Space', 'Enter']) {
		it(`selects the item when ${pressed} is pressed`, async () => {
			render(MenuHarness, { items: group() });
			trigger().focus();
			await userEvent.keyboard('[ArrowDown]');
			await expect.poll(() => document.activeElement).toBe(radio('one'));
			await userEvent.keyboard(`[${pressed}]`);
			expect(radio('one').hasAttribute('data-checked')).toBe(true);
		});
	}

	it('does not select when Space is pressed during typeahead', async () => {
		const onValueChange = vi.fn();
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: [
				{
					type: 'radio-group',
					props: { value: 0, onValueChange },
					items: [
						{ label: 'Item One', value: 1 },
						{ label: 'Item Two', value: 2 }
					]
				}
			]
		});
		radio('Item One').focus();
		await inOneTypeaheadRun(async () => {
			await userEvent.keyboard('Item T');
			await expect.poll(() => document.activeElement).toBe(radio('Item Two'));
			await userEvent.keyboard('[Space]');
			await userEvent.keyboard('[Space]');
		});
		expect(onValueChange).not.toHaveBeenCalled();
		expect(radio('Item Two').getAttribute('aria-checked')).toBe('false');
	});

	it('calls onValueChange with the item value', async () => {
		const onValueChange = vi.fn();
		render(MenuHarness, { items: group({ onValueChange }) });
		await userEvent.click(trigger());
		await userEvent.click(radio('two'));
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.lastCall?.[0]).toBe('two');
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('item-press');
	});

	it('does not select when onValueChange cancels', async () => {
		render(MenuHarness, {
			items: group({
				onValueChange: (_: unknown, details: { cancel(): void }) => details.cancel()
			})
		});
		await userEvent.click(trigger());
		await userEvent.click(radio('two'));
		expect(radio('two').getAttribute('aria-checked')).toBe('false');
	});

	it('keeps the value when closed and reopened', async () => {
		render(MenuHarness, {
			rootProps: { modal: false },
			portalProps: { keepMounted: true },
			items: group()
		});
		trigger().focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.click(radio('two'));
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('{Enter}');
		expect(radio('two').getAttribute('aria-checked')).toBe('true');
	});

	it('closes the menu on click with closeOnClick', async () => {
		render(MenuHarness, { items: group({}, [{ closeOnClick: true }]) });
		await userEvent.click(trigger());
		await userEvent.click(radio('one'));
		await expect.poll(() => menus().length).toBe(0);
	});

	it('keeps the menu open on click by default', async () => {
		render(MenuHarness, { items: group() });
		await userEvent.click(trigger());
		await userEvent.click(radio('one'));
		await settle();
		expect(menus().length).toBe(1);
	});

	it('can be focused but not activated when the group is disabled', async () => {
		const onValueChange = vi.fn();
		const onclick = vi.fn();
		const onkeydown = vi.fn();
		const onkeyup = vi.fn();
		const handlers = { onclick, onkeydown, onkeyup };
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: group({ disabled: true, onValueChange }, [handlers, handlers])
		});
		expect(radio('one').hasAttribute('data-disabled')).toBe(true);
		expect(radio('two').hasAttribute('data-disabled')).toBe(true);
		radio('one').focus();
		key(radio('one'), 'keydown', 'Enter');
		key(radio('one'), 'keyup', ' ');
		radio('one').click();
		key(radio('one'), 'keydown', 'ArrowDown');
		await expect.poll(() => document.activeElement).toBe(radio('two'));
		key(radio('two'), 'keydown', 'Enter');
		radio('two').click();
		expect(onkeydown).not.toHaveBeenCalled();
		expect(onkeyup).not.toHaveBeenCalled();
		expect(onclick).not.toHaveBeenCalled();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('can be focused but not activated when one item is disabled', async () => {
		const onValueChange = vi.fn();
		const onclick = vi.fn();
		const onkeydown = vi.fn();
		const handlers = { onclick, onkeydown };
		render(MenuHarness, {
			open: true,
			trigger: false,
			items: group({ onValueChange }, [{ ...handlers, disabled: true }, handlers])
		});
		expect(radio('one').hasAttribute('data-disabled')).toBe(true);
		expect(radio('two').hasAttribute('data-disabled')).toBe(false);
		radio('one').focus();
		key(radio('one'), 'keydown', 'Enter');
		radio('one').click();
		expect(onclick).not.toHaveBeenCalled();
		key(radio('one'), 'keydown', 'ArrowDown');
		expect(onkeydown).not.toHaveBeenCalled();
		await expect.poll(() => document.activeElement).toBe(radio('two'));
		key(radio('two'), 'keydown', 'Enter');
		expect(onkeydown).toHaveBeenCalledTimes(1);
		expect(onclick).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.calls[0][0]).toBe('two');
		key(radio('two'), 'keydown', 'ArrowDown');
		await expect.poll(() => document.activeElement).toBe(radio('one'));
	});
});

describe('Menu.RadioItemIndicator', () => {
	it('throws outside Menu.RadioItem', () => {
		expect(() => render(MenuOrphan, { part: 'radio-indicator' })).toThrow(
			'Base UI: MenuRadioItemContext is missing. MenuRadioItem parts must be placed within <Menu.RadioItem>.'
		);
	});

	it('renders only for the selected item and follows the selection', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false as const,
			rootProps: { modal: false },
			items: [
				{
					type: 'radio-group',
					props: { value: 'a' },
					items: [
						{ label: 'A', value: 'a', indicator: { 'data-testid': 'indicator-a' } },
						{ label: 'B', value: 'b', indicator: { 'data-testid': 'indicator-b' } }
					]
				}
			]
		});
		const a = document.querySelector('[data-testid="indicator-a"]');
		expect(a?.getAttribute('aria-hidden')).toBe('true');
		expect(a?.hasAttribute('data-checked')).toBe(true);
		expect(document.querySelector('[data-testid="indicator-b"]')).toBeNull();
		await userEvent.click(radio('B'));
		await expect.poll(() => document.querySelector('[data-testid="indicator-a"]')).toBeNull();
		expect(document.querySelector('[data-testid="indicator-b"]')).not.toBeNull();
	});
});

describe('Menu.Popup', () => {
	it('throws outside Menu.Positioner', () => {
		expect(() => render(MenuOrphan, { part: 'popup' })).toThrow(
			'Base UI: MenuPositionerContext is missing. MenuPositioner parts must be placed within <Menu.Positioner>.'
		);
	});

	it('keeps its own size variables when the consumer style changes', async () => {
		const view = render(MenuHarness, {
			open: true,
			viewport: true,
			items: items('One'),
			popupProps: { style: 'color: rgb(255, 0, 0)' }
		});
		const popup = menus()[0] as HTMLElement;
		const sizeVars = () =>
			`${popup.style.getPropertyValue('--popup-width')} ${popup.style.getPropertyValue('--popup-height')}`;
		// A resize that started from a measured size settles back on `auto`.
		await view.rerender({ popupProps: { style: 'color: rgb(0, 128, 0)' } });
		await expect.poll(() => sizeVars()).toBe('auto auto');
		await view.rerender({ popupProps: { style: 'color: rgb(0, 0, 255)' } });
		expect(popup.style.color).toBe('rgb(0, 0, 255)');
		expect(sizeVars()).toBe('auto auto');
	});

	it('is labelled by the trigger', async () => {
		render(MenuHarness, { triggerLabel: 'Actions', items: items('One') });
		await userEvent.click(trigger('Actions'));
		const popup = page.getByRole('menu', { name: 'Actions' }).element();
		expect(popup.getAttribute('aria-labelledby')).toBe(trigger('Actions').id);
	});

	it('uses an aria-label instead of the trigger label', async () => {
		render(MenuHarness, {
			open: true,
			triggerLabel: 'Actions',
			popupProps: { 'aria-label': 'Commands' }
		});
		const popup = page.getByRole('menu', { name: 'Commands' }).element();
		expect(popup.hasAttribute('aria-labelledby')).toBe(false);
	});

	it('uses a provided aria-labelledby', async () => {
		const label = document.createElement('span');
		label.id = 'commands-label';
		label.textContent = 'Commands';
		document.body.append(label);
		try {
			render(MenuHarness, {
				open: true,
				triggerLabel: 'Actions',
				popupProps: { 'aria-labelledby': 'commands-label' }
			});
			const popup = page.getByRole('menu', { name: 'Commands' }).element();
			expect(popup.getAttribute('aria-labelledby')).toBe('commands-label');
		} finally {
			label.remove();
		}
	});

	it('sets aria-orientation only on a horizontal popup', async () => {
		const view = render(MenuHarness, {
			open: true,
			trigger: false,
			rootProps: { orientation: 'horizontal' },
			items: items('One')
		});
		expect(menus()[0].getAttribute('aria-orientation')).toBe('horizontal');
		view.unmount();
		render(MenuHarness, { open: true, trigger: false, items: items('One') });
		expect(menus()[0].hasAttribute('aria-orientation')).toBe(false);
	});

	it('stops toolbar navigation keys without blocking other keys', async () => {
		const onParentKeyDown = vi.fn();
		render(MenuToolbarHarness, { onParentKeyDown });
		const popup = page.getByTestId('popup').element();
		key(popup, 'keydown', 'ArrowRight');
		expect(onParentKeyDown).not.toHaveBeenCalled();
		key(popup, 'keydown', 'F1');
		expect(onParentKeyDown).toHaveBeenCalled();
		expect(onParentKeyDown.mock.calls.every(([event]) => event.key === 'F1')).toBe(true);
	});

	it('enters the items at the list boundary when an arrow key leaves custom content', async () => {
		render(MenuHarness, {
			items: [{ type: 'button', label: 'Custom' }, ...items('One', 'Two', 'Three')]
		});
		await userEvent.click(trigger());
		item('One').focus();
		await userEvent.keyboard('[ArrowDown]');
		await expect.poll(() => document.activeElement).toBe(item('Two'));
		(page.getByRole('button', { name: 'Custom' }).element() as HTMLElement).focus();
		await userEvent.keyboard('[ArrowDown]');
		await expect.poll(() => document.activeElement).toBe(item('One'));
	});

	it('moves focus into the items when the boundary item is already highlighted', async () => {
		render(MenuHarness, {
			items: [{ type: 'button', label: 'Custom' }, ...items('One', 'Two', 'Three')]
		});
		trigger().focus();
		await userEvent.keyboard('[ArrowUp]');
		await expect.poll(() => item('Three').hasAttribute('data-highlighted')).toBe(true);
		(page.getByRole('button', { name: 'Custom' }).element() as HTMLElement).focus();
		expect(item('Three').hasAttribute('data-highlighted')).toBe(true);
		await userEvent.keyboard('[ArrowUp]');
		await expect.poll(() => document.activeElement).toBe(item('Three'));
		await userEvent.keyboard('[ArrowUp]');
		await expect.poll(() => document.activeElement).toBe(item('Two'));
	});

	describe('prop: finalFocus', () => {
		it('focuses the trigger by default', async () => {
			render(MenuFocusHarness, {});
			await userEvent.click(trigger());
			await userEvent.click(item('Close'));
			await expect.poll(() => document.activeElement).toBe(trigger());
		});

		it('focuses an element', async () => {
			render(MenuFocusHarness, { pick: (outside) => outside });
			await userEvent.click(trigger());
			await userEvent.click(item('Close'));
			await expect
				.poll(() => document.activeElement)
				.toBe(page.getByTestId('outside-target').element());
		});

		for (const [name, returns] of [
			['an element', 'element'],
			['true', true],
			['null', null]
		] as const) {
			it(`focuses the right element when a function returns ${name}`, async () => {
				const spy = vi.fn();
				render(MenuFocusHarness, {
					pick: (outside) => (closeType: string) => {
						spy(closeType);
						return returns === 'element' ? outside : returns;
					}
				});
				await userEvent.click(trigger());
				await userEvent.click(item('Close'));
				const expected =
					returns === 'element' ? page.getByTestId('outside-target').element() : trigger();
				await expect.poll(() => document.activeElement).toBe(expected);
				expect(spy).toHaveBeenCalledTimes(1);
			});
		}

		it('does not move focus when false', async () => {
			render(MenuFocusHarness, { finalFocus: false });
			await userEvent.click(trigger());
			await userEvent.click(item('Close'));
			await expect.poll(() => menus().length).toBe(0);
			await settle();
			expect(document.activeElement).not.toBe(trigger());
			expect(document.activeElement).toBe(document.body);
		});

		it('passes the close interaction type to a function', async () => {
			const spy = vi.fn();
			render(MenuFocusHarness, {
				pick: (outside) => (closeType: string) => {
					spy(closeType);
					return closeType === 'keyboard' ? outside : true;
				}
			});
			await userEvent.click(trigger());
			await userEvent.click(item('Close'));
			await expect.poll(() => document.activeElement).toBe(trigger());
			expect(spy).toHaveBeenNthCalledWith(1, 'mouse');
			trigger().focus();
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => menus().length).toBe(1);
			await userEvent.keyboard('{Enter}');
			await expect
				.poll(() => document.activeElement)
				.toBe(page.getByTestId('outside-target').element());
			expect(spy).toHaveBeenLastCalledWith('keyboard');
		});

		it('receives the mouse interaction type after a drag-release item selection', async () => {
			const spy = vi.fn();
			render(MenuFocusHarness, {
				pick: () => (closeType: string) => {
					spy(closeType);
					return true;
				}
			});
			mouse(trigger(), 'mousedown');
			await expect.poll(() => menus().length).toBe(1);
			// Item mouseup activates only 200ms after the opening press.
			await new Promise((resolve) => setTimeout(resolve, 200));
			mouse(item('Close'), 'mouseup');
			await expect.poll(() => menus().length).toBe(0);
			expect(spy).toHaveBeenLastCalledWith('mouse');
		});
	});
});

describe('Menu.Backdrop', () => {
	it('does not start an entry phase when initially open', async () => {
		render(MenuHarness, {
			open: true,
			trigger: false,
			backdrop: { 'data-testid': 'backdrop' },
			items: items('One')
		});
		const backdrop = page.getByTestId('backdrop').element();
		expect(backdrop.hasAttribute('data-starting-style')).toBe(false);
		expect(backdrop.hasAttribute('data-open')).toBe(true);
	});

	it('ignores pointer events when the menu opened on hover', async () => {
		render(MenuHarness, {
			trigger: { openOnHover: true, delay: 0 },
			backdrop: { 'data-testid': 'backdrop' },
			items: items('One')
		});
		await userEvent.hover(trigger());
		await expect
			.poll(() => (page.getByTestId('backdrop').element() as HTMLElement).style.pointerEvents)
			.toBe('none');
	});

	it('takes pointer events when the menu opened on click', async () => {
		render(MenuHarness, {
			backdrop: { 'data-testid': 'backdrop' },
			items: items('One')
		});
		await userEvent.click(trigger());
		await expect.poll(() => menus().length).toBe(1);
		expect((page.getByTestId('backdrop').element() as HTMLElement).style.pointerEvents).not.toBe(
			'none'
		);
	});
});

describe('Menu.Positioner', () => {
	it('throws outside Menu.Portal', () => {
		expect(() => render(MenuOrphan, { part: 'positioner' })).toThrow(
			'Base UI: <Menu.Portal> is missing.'
		);
	});

	it('closes an open submenu with a sibling reason when its parent closes', async () => {
		const onOpenChange = vi.fn();
		const spec = (open: boolean) => ({
			open,
			portalProps: { keepMounted: true },
			items: [
				{
					type: 'submenu' as const,
					label: 'More',
					rootProps: { open: true, onOpenChange },
					popupProps: { 'data-testid': 'submenu-popup' },
					items: items('Inner')
				}
			]
		});
		const view = render(MenuHarness, spec(true));
		await expect.poll(() => document.querySelector('[data-testid="submenu-popup"]')).not.toBeNull();
		await view.rerender(spec(false));
		await expect.poll(() => onOpenChange.mock.lastCall?.[0]).toBe(false);
		expect(onOpenChange.mock.lastCall?.[1].reason).toBe('sibling-open');
	});

	async function expectPlacedAt(left: number, top: number) {
		await expect
			.poll(() => {
				const rect = page.getByTestId('positioner').element().getBoundingClientRect();
				return [Math.round(rect.left), Math.round(rect.top)];
			})
			.toEqual([Math.round(left), Math.round(top)]);
	}

	for (const mode of ['element', 'function'] as const) {
		it(`is placed near the anchor when ${mode === 'element' ? 'an element' : 'a function'} is passed`, async () => {
			render(MenuAnchorHarness, { mode });
			const anchor = page.getByTestId('anchor').element().getBoundingClientRect();
			await expectPlacedAt(anchor.left, anchor.bottom);
		});
	}

	it('is placed at a virtual element', async () => {
		render(MenuAnchorHarness, { mode: 'virtual' });
		await expectPlacedAt(200, 100);
	});

	it('accepts a function that returns null', async () => {
		render(MenuAnchorHarness, { mode: 'null-function' });
		expect(page.getByTestId('positioner').element()).not.toBeNull();
		expect(page.getByRole('menuitem').elements()).toHaveLength(2);
	});

	it('follows the anchor changing to undefined and back', async () => {
		render(MenuAnchorHarness, { mode: 'toggle' });
		const anchor = page.getByTestId('anchor').element().getBoundingClientRect();
		await expectPlacedAt(anchor.left, anchor.bottom);
		await userEvent.click(page.getByRole('button', { name: 'undefined' }));
		const triggerRect = trigger('trigger').getBoundingClientRect();
		await expectPlacedAt(triggerRect.left, triggerRect.bottom);
		await userEvent.click(page.getByRole('button', { name: 'ref' }));
		await expectPlacedAt(anchor.left, anchor.bottom);
	});

	it('keeps the content mounted and hidden when closed with keepMounted', async () => {
		render(MenuHarness, {
			rootProps: { modal: false },
			portalProps: { keepMounted: true },
			positionerProps: { 'data-testid': 'positioner' },
			items: items('1', '2')
		});
		const positioner = page.getByTestId('positioner').element();
		expect(positioner.hasAttribute('hidden')).toBe(true);
		await userEvent.click(trigger());
		await expect.poll(() => positioner.hasAttribute('hidden')).toBe(false);
		await userEvent.click(trigger());
		await expect.poll(() => positioner.hasAttribute('hidden')).toBe(true);
		expect(menus().length).toBe(1);
	});

	it('unmounts the content when closed without keepMounted', async () => {
		render(MenuHarness, { rootProps: { modal: false }, items: items('1', '2') });
		expect(menus()).toEqual([]);
		await userEvent.click(trigger());
		await expect.poll(() => menus().length).toBe(1);
		await userEvent.click(trigger());
		await expect.poll(() => menus().length).toBe(0);
	});

	it('places a submenu at inline-end and start by default', async () => {
		render(MenuHarness, {
			open: true,
			items: [
				{
					type: 'submenu',
					label: 'More',
					rootProps: { open: true },
					positionerProps: { 'data-testid': 'sub-positioner' },
					items: items('Inner')
				}
			]
		});
		const positioner = page.getByTestId('sub-positioner').element();
		await expect.poll(() => positioner.getAttribute('data-side')).toBe('inline-end');
		expect(positioner.getAttribute('data-align')).toBe('start');
		expect(positioner.hasAttribute('data-nested')).toBe(true);
	});
});

describe('Menu.Arrow, Menu.Viewport and Menu.Portal', () => {
	it('renders an arrow with the positioner state', async () => {
		render(MenuHarness, { open: true, trigger: false, arrow: true, items: items('One') });
		const arrow = page.getByTestId('arrow').element();
		expect(arrow.tagName).toBe('DIV');
		expect(arrow.getAttribute('aria-hidden')).toBe('true');
		expect(arrow.hasAttribute('data-open')).toBe(true);
		expect(arrow.getAttribute('data-side')).toBe('bottom');
	});

	it('renders a viewport around the items', async () => {
		render(MenuHarness, { open: true, viewport: true, items: items('One') });
		const viewport = page.getByTestId('viewport').element();
		expect(viewport.tagName).toBe('DIV');
		expect(viewport.contains(item('One'))).toBe(true);
	});

	it('renders the portal into the body', async () => {
		render(MenuHarness, { open: true, trigger: false, items: items('One') });
		const portal = menus()[0].closest('[data-base-ui-portal]');
		expect(portal?.parentElement).toBe(document.body);
	});
});

describe('null attribute props', () => {
	const showDisabled = (name: string) =>
		createRawSnippet((_props: () => unknown, state: () => { disabled: boolean }) => ({
			render: () => `<span>${name} disabled: ${state().disabled}</span>`
		}));

	it('treats null id and disabled as absent', async () => {
		render(MenuHarness, {
			open: true,
			trigger: { id: null, disabled: null },
			filter: {
				providerProps: { value: 'Ren' },
				clear: { disabled: null, render: showDisabled('clear') }
			},
			items: [
				{ type: 'item', label: 'Rename', props: { id: null, disabled: null } },
				{ type: 'radio-group', props: { disabled: null, render: showDisabled('group') }, items: [] }
			]
		});
		const trigger = page.getByRole('button', { name: 'Open' }).element();
		const item = page.getByRole('menuitem', { name: 'Rename' }).element();
		expect({
			triggerId: trigger.id.startsWith('base-ui-'),
			triggerDisabled: trigger.hasAttribute('data-disabled'),
			itemId: item.id.startsWith('base-ui-'),
			itemDisabled: item.hasAttribute('aria-disabled')
		}).toEqual({ triggerId: true, triggerDisabled: false, itemId: true, itemDisabled: false });
		await expect.element(page.getByText('group disabled: false')).toBeInTheDocument();
		await expect.element(page.getByText('clear disabled: false')).toBeInTheDocument();
	});
});
