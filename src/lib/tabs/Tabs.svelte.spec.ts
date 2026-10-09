// Assertions follow Base UI v1.8.0 packages/react/src/tabs/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, StrictMode, Suspense, Popover, and Dialog are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TabsHarness from '../../tests/TabsHarness.svelte';
import { Tabs } from './index.js';

const ENDING_CSS = `
	@keyframes tabs-panel-out { to { opacity: 0; } }
	.animation-test-panel[data-ending-style] { animation: tabs-panel-out 80ms; }
`;

function tab(name: string) {
	return page.getByRole('tab', { name, exact: true });
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		value: unknown;
		reason: string;
		canceled: boolean;
		direction: string;
	}[];
}

const three = [
	{ value: 0, label: 'One', panel: 'Panel one' },
	{ value: 1, label: 'Two', panel: 'Panel two' },
	{ value: 2, label: 'Three', panel: 'Panel three' }
];

describe('Tabs', () => {
	describe('context', () => {
		it('throws when a tab is rendered outside Tabs.List', async () => {
			await expect(async () => {
				await render(Tabs.Tab, { value: 0 });
			}).rejects.toThrow(
				'Base UI: TabsRootContext is missing. Tabs parts must be placed within <Tabs.Root>.'
			);
		});

		it('throws when a panel is rendered outside Tabs.Root', async () => {
			await expect(async () => {
				await render(Tabs.Panel, { value: 0 });
			}).rejects.toThrow(
				'Base UI: TabsRootContext is missing. Tabs parts must be placed within <Tabs.Root>.'
			);
		});
	});

	describe('ARIA', () => {
		it('links the selected tab and panel', async () => {
			render(TabsHarness, { passValue: true, value: 0 });
			const one = tab('One');
			const panel = page.getByRole('tabpanel');

			await expect.element(page.getByRole('tablist', { name: 'Sections' })).toBeVisible();
			await expect.element(one).toHaveAttribute('aria-selected', 'true');
			await expect.element(one).toHaveAttribute('type', 'button');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
			await expect.element(one).toHaveAttribute('aria-controls', panel.element().id);
			expect(panel.element().id).toMatch(/^base-ui-/);
			await expect.element(panel).toHaveAttribute('aria-labelledby', one.element().id);
			await expect.element(panel).toHaveTextContent('Panel one');
			await expect.poll(() => page.getByTestId('panel-1').elements().length).toBe(0);
		});

		it('does not set aria-orientation by default and sets it when vertical', async () => {
			render(TabsHarness, { passValue: true, value: 0 });
			const list = page.getByRole('tablist', { name: 'Sections' });
			await expect.element(list).not.toHaveAttribute('aria-orientation');
			await expect.element(list).toHaveAttribute('data-orientation', 'horizontal');

			render(TabsHarness, { passValue: true, value: 0, orientation: 'vertical' });
			await expect
				.element(page.getByRole('tablist', { name: 'Sections' }).nth(1))
				.toHaveAttribute('aria-orientation', 'vertical');
		});
	});

	describe('selection', () => {
		it('writes the first selection into an empty bind', async () => {
			render(TabsHarness, { bind: true });
			await expect.poll(() => page.getByTestId('held').element().textContent).toBe('0');
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			expect(page.getByTestId('held').element().textContent).toBe('1');
		});

		it('follows a parent change after the first click', async () => {
			render(TabsHarness, { bind: true });
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			await page.getByRole('button', { name: 'Set zero' }).click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
			expect(page.getByTestId('held').element().textContent).toBe('0');
		});

		it('selects the clicked tab', async () => {
			render(TabsHarness, { bind: true, value: 0 });
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'false');
			await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel two');
			expect(calls().at(-1)).toMatchObject({ value: 1, reason: 'none', canceled: false });
			expect(page.getByTestId('held').element().textContent).toBe('1');
		});

		it('does not call onValueChange when the active tab is pressed', async () => {
			render(TabsHarness, { passValue: true, value: 0 });
			await tab('One').click();
			expect(calls()).toEqual([]);
		});

		it('does not select a disabled tab', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 0,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one' },
					{ value: 1, label: 'Two', panel: 'Panel two', disabled: true }
				]
			});
			const two = tab('Two');
			await expect.element(two).toHaveAttribute('aria-disabled', 'true');
			await expect.element(two).toHaveAttribute('data-disabled', '');
			await two.click({ force: true });
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			expect(calls()).toEqual([]);
		});

		it('supports string values', async () => {
			render(TabsHarness, {
				bind: true,
				value: 'overview',
				tabs: [
					{ value: 'overview', label: 'One', panel: 'Panel one' },
					{ value: 'details', label: 'Two', panel: 'Panel two' }
				]
			});
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			expect(page.getByTestId('held').element().textContent).toBe('"details"');
		});
	});

	describe('automatic value', () => {
		it('notifies the implicit initial selection', async () => {
			render(TabsHarness, { tabs: three });
			await expect
				.poll(() => calls())
				.toEqual([{ value: 0, reason: 'initial', canceled: false, direction: 'none' }]);
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
		});

		it('selects a later tab whose value is the implicit default', async () => {
			render(TabsHarness, {
				tabs: [
					{ value: 1, label: 'One', panel: 'Panel one' },
					{ value: 0, label: 'Two', panel: 'Panel two' }
				]
			});
			await expect.poll(() => calls()[0]?.value).toBe(0);
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'false');
		});

		it('moves off a disabled implicit first tab', async () => {
			render(TabsHarness, {
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two' },
					{ value: 2, label: 'Three', panel: 'Panel three' }
				]
			});
			await expect
				.poll(() => calls())
				.toEqual([{ value: 1, reason: 'initial', canceled: false, direction: 'none' }]);
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});

		it('does not let cancel stop an automatic change', async () => {
			render(TabsHarness, {
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two' }
				],
				onValueChange: (_value, details) => details.cancel()
			});
			await expect.poll(() => calls()[0]?.value).toBe(1);
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			expect(calls()[0]?.canceled).toBe(false);
		});

		it('selects nothing when every tab is disabled', async () => {
			render(TabsHarness, {
				keepMounted: true,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two', disabled: true }
				]
			});
			await expect.poll(() => calls()[0]).toMatchObject({ value: null, reason: 'initial' });
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'false');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
			await expect.element(page.getByTestId('panel-0')).toHaveAttribute('hidden');
		});

		it('does not notify on mount when value is passed', async () => {
			render(TabsHarness, { passValue: true, value: 1, tabs: three });
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			expect(calls()).toEqual([]);
		});

		it('honors a passed value that points at a disabled tab', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 0,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two' }
				]
			});
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			expect(calls()).toEqual([]);
		});

		it('falls back when the selected tab becomes disabled and value was omitted', async () => {
			render(TabsHarness, { tabs: three });
			await expect.poll(() => calls().length).toBe(1);
			await page.getByRole('button', { name: 'Disable first' }).click();
			await expect.poll(() => calls().at(-1)?.reason).toBe('disabled');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});

		it('does not move a passed value when its tab becomes disabled', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three });
			await page.getByRole('button', { name: 'Disable first' }).click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			expect(calls()).toEqual([]);
		});

		it('falls back when the selected tab is removed and value was omitted', async () => {
			render(TabsHarness, { tabs: three });
			await expect.poll(() => calls().length).toBe(1);
			await page.getByRole('button', { name: 'Remove first' }).click();
			await expect.poll(() => calls().at(-1)?.reason).toBe('missing');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('cancellation', () => {
		it('keeps the selection when a click is canceled', async () => {
			render(TabsHarness, {
				onValueChange: (_value, details) => details.cancel()
			});
			await expect.poll(() => calls().length).toBe(1);
			await tab('Two').click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			expect(calls().at(-1)).toMatchObject({ value: 1, reason: 'none', canceled: true });
		});

		it('skips activation when click calls preventDefault', async () => {
			render(TabsHarness, { passValue: true, value: 0 });
			const two = tab('Two');
			two.element().addEventListener('click', (event) => event.preventDefault(), { capture: true });
			await two.click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('keyboard', () => {
		it('moves focus without activating until Enter', async () => {
			render(TabsHarness, { bind: true, value: 0, tabs: three });
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('Two')).toHaveFocus();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
			await expect.element(tab('Two')).toHaveAttribute('tabindex', '0');
			await expect.element(tab('One')).toHaveAttribute('tabindex', '-1');
			await userEvent.keyboard('{Enter}');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});

		it('activates with Space', async () => {
			render(TabsHarness, { bind: true, value: 0, tabs: three });
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await userEvent.keyboard(' ');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});

		it('wraps and jumps with Home and End', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three });
			await tab('One').click();
			await userEvent.keyboard('{End}');
			await expect.element(tab('Three')).toHaveFocus();
			await userEvent.keyboard('{Home}');
			await expect.element(tab('One')).toHaveFocus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(tab('Three')).toHaveFocus();
		});

		it('does not wrap when loopFocus is false', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three, loopFocus: false });
			await tab('One').click();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(tab('One')).toHaveFocus();
		});

		it('follows vertical arrows and ignores horizontal ones', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 0,
				tabs: three,
				orientation: 'vertical'
			});
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('One')).toHaveFocus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(tab('Two')).toHaveFocus();
		});

		it('swaps horizontal arrows in RTL', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three, dir: 'rtl' });
			await tab('One').click();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(tab('Two')).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('One')).toHaveFocus();
		});

		it('moves focus onto a disabled tab without selecting it', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 0,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one' },
					{ value: 1, label: 'Two', panel: 'Panel two', disabled: true },
					{ value: 2, label: 'Three', panel: 'Panel three' }
				]
			});
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('Two')).toHaveFocus();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			await userEvent.keyboard('{Enter}');
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
		});

		it('skips a natively disabled tab', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 0,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one' },
					{ value: 1, label: 'Two', panel: 'Panel two' },
					{ value: 2, label: 'Three', panel: 'Panel three' }
				]
			});
			tab('Two').element().setAttribute('disabled', '');
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('Three')).toHaveFocus();
		});

		it('selects the tab arrow keys move to when activateOnFocus is set', async () => {
			render(TabsHarness, { bind: true, value: 0, tabs: three, activateOnFocus: true });
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('Two')).toHaveFocus();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			expect(calls().at(-1)?.direction).toBe('right');
		});

		it('does not activate a tab focused by a secondary button press', async () => {
			render(TabsHarness, { passValue: true, value: 0, activateOnFocus: true });
			const two = tab('Two');
			two
				.element()
				.dispatchEvent(
					new PointerEvent('pointerdown', { button: 2, bubbles: true, cancelable: true })
				);
			two.element().focus();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			expect(calls()).toEqual([]);
		});
	});

	describe('roving tabindex', () => {
		it('keeps the tab stop off a programmatically selected disabled tab', async () => {
			render(TabsHarness, {
				bind: true,
				value: 1,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two' },
					{ value: 2, label: 'Three', panel: 'Panel three' }
				]
			});
			await expect.element(tab('Two')).toHaveAttribute('tabindex', '0');
			await page.getByRole('button', { name: 'Set zero' }).click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('One')).toHaveAttribute('tabindex', '-1');
			await expect.element(tab('Two')).toHaveAttribute('tabindex', '0');
		});

		it('keeps the tab stop on a disabled tab after an arrow, so Tab leaves the list', async () => {
			render(TabsHarness, {
				passValue: true,
				value: 2,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one' },
					{ value: 1, label: 'Two', panel: 'Panel two', disabled: true },
					{ value: 2, label: 'Three', panel: 'Panel three' }
				]
			});
			await tab('Three').click();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.element(tab('Two')).toHaveFocus();
			expect(
				['One', 'Two', 'Three'].map((name) => tab(name).element().getAttribute('tabindex'))
			).toEqual(['-1', '0', '-1']);
			await userEvent.keyboard('{Tab}');
			await expect.element(page.getByTestId('panel-2')).toHaveFocus();
		});

		it('gives the first tab the stop when every tab is disabled and nothing is selected', async () => {
			render(TabsHarness, {
				passValue: true,
				value: null,
				tabs: [
					{ value: 0, label: 'One', panel: 'Panel one', disabled: true },
					{ value: 1, label: 'Two', panel: 'Panel two', disabled: true },
					{ value: 2, label: 'Three', panel: 'Panel three', disabled: true }
				]
			});
			await expect.element(tab('One')).toHaveAttribute('tabindex', '0');
			await expect.element(tab('Two')).toHaveAttribute('tabindex', '-1');
			await expect.element(tab('Three')).toHaveAttribute('tabindex', '-1');
		});

		it('gives the tab stop to the successor when the highlighted tab is removed', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three });
			await tab('One').click();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(tab('Two')).toHaveAttribute('tabindex', '0');
			await page.getByRole('button', { name: 'Remove second' }).click();
			await expect.element(tab('Three')).toHaveAttribute('tabindex', '0');
			await expect.element(tab('One')).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('activation direction', () => {
		it('sets data-activation-direction when the parent changes the value', async () => {
			render(TabsHarness, { passValue: true, value: 0, tabs: three });
			await page.getByRole('button', { name: 'Set one' }).click();
			await expect
				.element(page.getByRole('tablist', { name: 'Sections' }))
				.toHaveAttribute('data-activation-direction', 'right');
			await expect.element(tab('Two')).toHaveAttribute('data-activation-direction', 'right');
		});

		it('sets data-activation-direction from a click', async () => {
			render(TabsHarness, { bind: true, value: 0, tabs: three });
			await tab('Two').click();
			await expect
				.element(page.getByRole('tablist', { name: 'Sections' }))
				.toHaveAttribute('data-activation-direction', 'right');
			await expect.element(tab('Two')).toHaveAttribute('data-activation-direction', 'right');
		});
	});

	describe('panels', () => {
		it('keeps closed panels mounted and indexed', async () => {
			render(TabsHarness, { passValue: true, value: 0, keepMounted: true });
			const panels = page.getByRole('tabpanel', { includeHidden: true });
			await expect.element(panels.nth(0)).not.toHaveAttribute('hidden');
			await expect.element(panels.nth(1)).toHaveAttribute('hidden');
			await expect.element(panels.nth(0)).toHaveAttribute('data-index', '0');
			await expect.element(panels.nth(1)).toHaveAttribute('data-index', '1');
			await expect.element(panels.nth(1)).toHaveAttribute('data-hidden', '');
		});

		it('applies data-ending-style before a closed panel unmounts', async () => {
			const style = document.createElement('style');
			style.textContent = ENDING_CSS;
			document.head.append(style);
			render(TabsHarness, { passValue: true, value: 0 });
			page.getByTestId('panel-0').element().classList.add('animation-test-panel');

			let sawEnding = false;
			const observer = new MutationObserver(() => {
				const panel = document.querySelector('[data-testid="panel-0"]');
				if (panel?.hasAttribute('data-ending-style')) sawEnding = true;
			});
			observer.observe(document.body, { attributes: true, childList: true, subtree: true });
			await tab('Two').click();
			await expect.poll(() => page.getByTestId('panel-0').elements().length).toBe(0);
			observer.disconnect();
			style.remove();
			expect(sawEnding).toBe(true);
		});
	});

	describe('indicator', () => {
		it('sets CSS variables for the active tab', async () => {
			render(TabsHarness, { passValue: true, value: 0, showIndicator: true });
			const indicator = page.getByTestId('indicator');
			await expect
				.poll(() => indicator.element().style.getPropertyValue('--active-tab-width'))
				.not.toBe('');
			await expect.element(indicator).toHaveAttribute('role', 'presentation');
			await expect.element(indicator).not.toHaveAttribute('hidden');
		});

		it('updates the indicator when the active tab resizes', async () => {
			render(TabsHarness, { passValue: true, value: 0, showIndicator: true });
			const indicator = page.getByTestId('indicator');
			await expect
				.poll(() => indicator.element().style.getPropertyValue('--active-tab-width'))
				.not.toBe('');
			const before = indicator.element().style.getPropertyValue('--active-tab-width');
			const tab = page.getByRole('tab', { name: 'One' }).element() as HTMLElement;
			tab.style.width = '240px';
			await expect
				.poll(() => indicator.element().style.getPropertyValue('--active-tab-width'))
				.not.toBe(before);
		});

		it('moves the indicator when a tab before the active one resizes (list width fixed)', async () => {
			render(TabsHarness, { passValue: true, value: 1, showIndicator: true });
			const indicator = page.getByTestId('indicator');
			const list = page.getByRole('tablist').element() as HTMLElement;
			list.style.width = '600px';
			list.style.display = 'flex';
			const read = () => indicator.element().style.getPropertyValue('--active-tab-left');
			await expect.poll(read).not.toBe('');
			await new Promise((r) => setTimeout(r, 100));
			const before = read();
			const first = page.getByRole('tab', { name: 'One' }).element() as HTMLElement;
			const active = page.getByRole('tab', { name: 'Two' }).element() as HTMLElement;
			const leftBefore = active.getBoundingClientRect().left;
			first.style.width = '200px';
			await new Promise((r) => setTimeout(r, 50));
			expect(active.getBoundingClientRect().left).not.toBeCloseTo(leftBefore, 0);
			await expect.poll(read, { timeout: 1000 }).not.toBe(before);
		});

		it('moves the indicator to a newly selected tab', async () => {
			render(TabsHarness, { showIndicator: true });
			const indicator = page.getByTestId('indicator');
			const read = () => indicator.element().style.getPropertyValue('--active-tab-left');
			await expect.poll(read).not.toBe('');
			const selectedLeft = () => {
				const tab = page.getByRole('tab', { selected: true }).element() as HTMLElement;
				const list = page.getByRole('tablist').element() as HTMLElement;
				return tab.getBoundingClientRect().left - list.getBoundingClientRect().left;
			};
			await expect.poll(() => Math.abs(parseFloat(read()) - selectedLeft()) < 1).toBe(true);
			const before = read();
			await userEvent.click(page.getByRole('tab', { name: 'Two' }));
			await expect
				.element(page.getByRole('tab', { name: 'Two' }))
				.toHaveAttribute('aria-selected', 'true');
			await expect.poll(read, { timeout: 1000 }).not.toBe(before);
		});
	});

	describe('native Svelte', () => {
		it('starts from defaultValue and returns to it when a controlled value is cleared', async () => {
			render(TabsHarness, { defaultValue: 1, tabs: three });
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');

			render(TabsHarness, { passValue: true, value: 1, defaultValue: 0, tabs: three });
			await expect.element(tab('Two').nth(1)).toHaveAttribute('aria-selected', 'true');
			await page.getByRole('button', { name: 'Unset value' }).nth(1).click();
			await expect.element(tab('One').nth(1)).toHaveAttribute('aria-selected', 'true');
		});

		it('renders through a snippet and a consumer attachment', async () => {
			render(TabsHarness, { passValue: true, value: 0, custom: true });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toHaveAttribute('role', 'tab');
			await expect.element(custom).toHaveAttribute('data-active-state', 'true');

			render(TabsHarness, { passValue: true, value: 0, attach: true });
			await expect.element(page.getByTestId('attached').nth(1)).toHaveTextContent('One');
		});

		it('activates an anchor tab', async () => {
			render(TabsHarness, {
				bind: true,
				value: 'overview',
				tabs: [
					{ value: 'overview', label: 'One', panel: 'Panel one', native: false },
					{ value: 'details', label: 'Two', panel: 'Panel two', native: false }
				]
			});
			await expect.element(tab('One')).toHaveRole('tab');
			expect(tab('One').element().tagName).toBe('A');
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
		});

		it('keeps a nested root independent', async () => {
			render(TabsHarness, { passValue: true, value: 0, nested: true, omitPanels: true });
			await tab('Inner B').click();
			await expect.element(tab('Inner B')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
		});

		it('one-way value stays at the click until the parent changes it', async () => {
			render(TabsHarness, { passValue: true, value: 0, record: false });
			await tab('Two').click();
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'true');
			await page.getByRole('button', { name: 'Clear value' }).click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'false');
			await expect.element(tab('Two')).toHaveAttribute('aria-selected', 'false');
			await page.getByRole('button', { name: 'Set zero' }).click();
			await expect.element(tab('One')).toHaveAttribute('aria-selected', 'true');
		});
	});
});
