import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DefaultPropsHarness, { type DefaultPropsCase } from './DefaultPropsHarness.svelte';

const button = (name: string) => page.getByRole('button', { name, exact: true });
const click = (name: string) => (button(name).element() as HTMLElement).click();

async function closesFromDefaultOpen(part: DefaultPropsCase, role: 'dialog' | 'alertdialog') {
	render(DefaultPropsHarness, { part });
	await expect.element(page.getByRole(role)).toBeVisible();
	click('Close');
	await expect.element(page.getByRole(role)).not.toBeInTheDocument();
}

/** `defaultTriggerId` names the trigger an initially open popup belongs to. */
async function startsOnSecondTrigger(part: DefaultPropsCase, close: () => Promise<void>) {
	render(DefaultPropsHarness, { part });
	// A modal popup hides the triggers from the accessibility tree, so find them by id.
	const expanded = (id: string) => document.getElementById(id)?.getAttribute('aria-expanded');
	await expect.poll(() => expanded('second')).toBe('true');
	expect(expanded('first')).toBe('false');
	await close();
	await expect.poll(() => expanded('second')).toBe('false');
}

async function startsOnSecondLink(part: DefaultPropsCase) {
	render(DefaultPropsHarness, { part });
	const second = page.getByRole('link', { name: 'Second' });
	await expect.element(second).toHaveAttribute('data-popup-open', '');
	expect(page.getByRole('link', { name: 'First' }).element().hasAttribute('data-popup-open')).toBe(
		false
	);
	await userEvent.keyboard('{Escape}');
	await expect.element(second).not.toHaveAttribute('data-popup-open');
}

const escape = () => userEvent.keyboard('{Escape}');

describe('default* props start uncontrolled state that a user change then moves', () => {
	it('Accordion.Root defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'accordion' });
		await expect.element(button('Section')).toHaveAttribute('aria-expanded', 'true');
		click('Section');
		await expect.element(button('Section')).toHaveAttribute('aria-expanded', 'false');
	});

	it('Collapsible.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'collapsible' });
		await expect.element(button('Trigger')).toHaveAttribute('aria-expanded', 'true');
		click('Trigger');
		await expect.element(button('Trigger')).toHaveAttribute('aria-expanded', 'false');
	});

	it('Toggle defaultPressed', async () => {
		render(DefaultPropsHarness, { part: 'toggle' });
		await expect.element(button('Bold')).toHaveAttribute('aria-pressed', 'true');
		click('Bold');
		await expect.element(button('Bold')).toHaveAttribute('aria-pressed', 'false');
	});

	it('ToggleGroup defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'toggle-group' });
		await expect.element(button('A')).toHaveAttribute('aria-pressed', 'true');
		click('B');
		await expect.element(button('B')).toHaveAttribute('aria-pressed', 'true');
		await expect.element(button('A')).toHaveAttribute('aria-pressed', 'false');
	});

	it('Tabs.Root defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'tabs' });
		const tab = (name: string) => page.getByRole('tab', { name, exact: true });
		await expect.element(tab('B')).toHaveAttribute('aria-selected', 'true');
		(tab('A').element() as HTMLElement).click();
		await expect.element(tab('A')).toHaveAttribute('aria-selected', 'true');
		await expect.element(tab('B')).toHaveAttribute('aria-selected', 'false');
	});

	it('Dialog.Root defaultOpen', () => closesFromDefaultOpen('dialog', 'dialog'));
	it('AlertDialog.Root defaultOpen', () => closesFromDefaultOpen('alert-dialog', 'alertdialog'));

	it('AlertDialog.Root open={false} wins over defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'alert-dialog-closed' });
		await expect.element(button('First')).toHaveAttribute('aria-expanded', 'false');
		expect(page.getByRole('alertdialog').query()).toBeNull();
		click('First');
		await expect.element(page.getByRole('alertdialog')).toBeVisible();
	});
	it('Drawer.Root defaultOpen', () => closesFromDefaultOpen('drawer', 'dialog'));
	it('Popover.Root defaultOpen', () => closesFromDefaultOpen('popover', 'dialog'));

	it('Dialog.Root defaultTriggerId', () =>
		startsOnSecondTrigger('dialog-trigger', async () => click('Close')));
	it('AlertDialog.Root defaultTriggerId', () =>
		startsOnSecondTrigger('alert-dialog-trigger', async () => click('Close')));
	it('Drawer.Root defaultTriggerId', () =>
		startsOnSecondTrigger('drawer-trigger', async () => click('Close')));
	it('Popover.Root defaultTriggerId', () =>
		startsOnSecondTrigger('popover-trigger', async () => click('Close')));
	it('Menu.Root defaultTriggerId', () => startsOnSecondTrigger('menu-trigger', escape));

	it('Tooltip.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'tooltip' });
		await expect.element(page.getByTestId('popup')).toBeVisible();
		await escape();
		await expect.element(page.getByTestId('popup')).not.toBeInTheDocument();
	});

	it('Tooltip.Root defaultTriggerId', async () => {
		render(DefaultPropsHarness, { part: 'tooltip-trigger' });
		await expect.element(button('Second')).toHaveAttribute('data-popup-open', '');
		expect(button('First').element().hasAttribute('data-popup-open')).toBe(false);
		await escape();
		await expect.element(button('Second')).not.toHaveAttribute('data-popup-open');
	});

	it('PreviewCard.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'preview-card' });
		await expect.element(page.getByTestId('popup')).toBeVisible();
		await escape();
		await expect.element(page.getByTestId('popup')).not.toBeInTheDocument();
	});

	it('PreviewCard.Root defaultTriggerId', () => startsOnSecondLink('preview-card-trigger'));

	it('Menu.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'menu' });
		await expect.element(page.getByRole('menu')).toBeVisible();
		(page.getByRole('menuitem', { name: 'Rename' }).element() as HTMLElement).click();
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('Menu.SubmenuRoot defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'menu-submenu' });
		const archive = page.getByRole('menuitem', { name: 'Archive' });
		await expect.element(archive).toBeVisible();
		(archive.element() as HTMLElement).click();
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('ContextMenu.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'context-menu' });
		await expect.element(page.getByRole('menu')).toBeVisible();
		(page.getByRole('menuitem', { name: 'Copy' }).element() as HTMLElement).click();
		await expect.element(page.getByRole('menu')).not.toBeInTheDocument();
	});

	it('Menu.CheckboxItem defaultChecked', async () => {
		render(DefaultPropsHarness, { part: 'menu-checkbox-item' });
		const item = page.getByRole('menuitemcheckbox', { name: 'Wrap' });
		await expect.element(item).toHaveAttribute('aria-checked', 'true');
		(item.element() as HTMLElement).click();
		await expect.element(item).toHaveAttribute('aria-checked', 'false');
	});

	it('Menu.RadioGroup defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'menu-radio-group' });
		const item = (name: string) => page.getByRole('menuitemradio', { name, exact: true });
		await expect.element(item('B')).toHaveAttribute('aria-checked', 'true');
		(item('A').element() as HTMLElement).click();
		await expect.element(item('A')).toHaveAttribute('aria-checked', 'true');
		await expect.element(item('B')).toHaveAttribute('aria-checked', 'false');
	});

	it('Menu.FilterProvider defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'menu-filter' });
		const input = page.getByRole('searchbox', { name: 'Filter actions' });
		await expect.element(input).toHaveValue('ren');
		await expect.element(page.getByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
		await userEvent.clear(input);
		await expect.element(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
	});

	it('NavigationMenu.Root defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'navigation-menu' });
		await expect.element(button('Overview')).toHaveAttribute('aria-expanded', 'true');
		click('Overview');
		await expect.element(button('Overview')).toHaveAttribute('aria-expanded', 'false');
	});

	it('Select.Root defaultOpen', async () => {
		render(DefaultPropsHarness, { part: 'select' });
		await expect.element(page.getByRole('listbox')).toBeVisible();
		(page.getByRole('option', { name: 'Banana' }).element() as HTMLElement).click();
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
		await expect.element(page.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Banana');
	});

	it.each(['combobox', 'autocomplete'] as const)('%s root defaultOpen', async (part) => {
		render(DefaultPropsHarness, { part });
		const input = page.getByRole('combobox', { name: 'Fruit' });
		await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('option', { name: 'Apple' })).toBeVisible();
		(input.element() as HTMLElement).focus();
		await escape();
		await expect.element(input).toHaveAttribute('aria-expanded', 'false');
	});

	it('Toolbar.Input defaultValue', async () => {
		render(DefaultPropsHarness, { part: 'toolbar-input' });
		const input = page.getByRole('textbox', { name: 'Search' });
		await expect.element(input).toHaveValue('draft');
		await userEvent.fill(input, 'final');
		await expect.element(input).toHaveValue('final');
	});
});
