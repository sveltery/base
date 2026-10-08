import { page } from 'vitest/browser';
import { expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ControllableRootsHarness from './ControllableRootsHarness.svelte';

type Part =
	| 'switch'
	| 'checkbox'
	| 'toggle'
	| 'collapsible'
	| 'accordion'
	| 'toggle-group'
	| 'checkbox-group';

const targets: Record<
	Part,
	{
		role: 'switch' | 'checkbox' | 'button';
		name?: string;
		attribute: string;
		on: string;
		wrote: string;
	}
> = {
	switch: { role: 'switch', attribute: 'aria-checked', on: 'true', wrote: 'true' },
	checkbox: { role: 'checkbox', attribute: 'aria-checked', on: 'true', wrote: 'true' },
	toggle: { role: 'button', name: 'Bold', attribute: 'aria-pressed', on: 'true', wrote: 'true' },
	collapsible: {
		role: 'button',
		name: 'Trigger',
		attribute: 'aria-expanded',
		on: 'true',
		wrote: 'true'
	},
	accordion: {
		role: 'button',
		name: 'Section',
		attribute: 'aria-expanded',
		on: 'true',
		wrote: 'a'
	},
	'toggle-group': { role: 'button', name: 'A', attribute: 'aria-pressed', on: 'true', wrote: 'a' },
	'checkbox-group': {
		role: 'checkbox',
		name: 'A',
		attribute: 'aria-checked',
		on: 'true',
		wrote: 'a'
	}
};

function control(part: Part) {
	const target = targets[part];
	return target.name
		? page.getByRole(target.role, { name: target.name, exact: true })
		: page.getByRole(target.role);
}

/** Three cases that fail when a root keeps its own `$bindable` instead of the helper. */
export function controllableRootCases(part: Part) {
	const target = targets[part];

	it('bind starting from undefined receives the first write', async () => {
		render(ControllableRootsHarness, { part, mode: 'bind' });
		await expect.element(page.getByTestId('owner')).toHaveTextContent('none');
		(control(part).element() as HTMLElement).click();
		await expect.element(page.getByTestId('owner')).toHaveTextContent(target.wrote);
	});

	it('a parent write updates the control and does not notify', async () => {
		const onChange = vi.fn();
		render(ControllableRootsHarness, { part, mode: 'parent', onChange });
		await expect.element(control(part)).toHaveAttribute(target.attribute, 'false');
		(page.getByRole('button', { name: 'Set value' }).element() as HTMLElement).click();
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		expect(onChange).not.toHaveBeenCalled();
	});

	it('a parent set, unset, and click logs only the click', async () => {
		render(ControllableRootsHarness, { part, mode: 'journal' });
		const clickLog =
			part === 'collapsible'
				? 'true:trigger-press'
				: part === 'accordion'
					? 'a:trigger-press'
					: part === 'toggle-group' || part === 'checkbox-group'
						? 'a:none'
						: 'true:none';
		await expect.element(control(part)).toHaveAttribute(target.attribute, 'false');
		(page.getByRole('button', { name: 'Set value', exact: true }).element() as HTMLElement).click();
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		(
			page.getByRole('button', { name: 'Unset value', exact: true }).element() as HTMLElement
		).click();
		await expect.element(control(part)).toHaveAttribute(target.attribute, 'false');
		(control(part).element() as HTMLElement).click();
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		expect(page.getByTestId('log').element().textContent).toBe(clickLog);
	});

	it('a default-only render shows the default and does not notify', async () => {
		const onChange = vi.fn();
		render(ControllableRootsHarness, { part, mode: 'default', onChange });
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		expect(onChange).not.toHaveBeenCalled();
	});
}

/** Parent writes that store a fresh array must not call back or loop. */
export function controllableCopyCases() {
	it('a copied ToggleGroup write-back does not exceed the effect depth', async () => {
		render(ControllableRootsHarness, { part: 'toggle-group', mode: 'copy' });
		(page.getByRole('button', { name: 'Set value' }).element() as HTMLElement).click();
		await expect
			.element(page.getByRole('button', { name: 'B', exact: true }))
			.toHaveAttribute('aria-pressed', 'true');
		expect(page.getByTestId('copies').element().textContent).toBe('0');
	});

	it('an Accordion parent write that stores a copy calls onValueChange zero times', async () => {
		render(ControllableRootsHarness, { part: 'accordion', mode: 'copy' });
		(page.getByRole('button', { name: 'Set value' }).element() as HTMLElement).click();
		await expect
			.element(page.getByRole('button', { name: 'Section', exact: true }))
			.toHaveAttribute('aria-expanded', 'true');
		expect(page.getByTestId('copies').element().textContent).toBe('0');
	});

	it('a CheckboxGroup parent write that stores a copy calls onValueChange zero times', async () => {
		render(ControllableRootsHarness, { part: 'checkbox-group', mode: 'copy' });
		(page.getByRole('button', { name: 'Set value' }).element() as HTMLElement).click();
		await expect
			.element(page.getByRole('checkbox', { name: 'A', exact: true }))
			.toHaveAttribute('aria-checked', 'true');
		expect(page.getByTestId('copies').element().textContent).toBe('0');
	});

	it('a confirm pattern prompts once', async () => {
		render(ControllableRootsHarness, { part: 'switch', mode: 'confirm' });
		(page.getByRole('switch').element() as HTMLElement).click();
		await expect.element(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
		expect(page.getByTestId('prompts').element().textContent).toBe('1');
	});
}
