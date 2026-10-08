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

	it('a parent write notifies once after the DOM updates', async () => {
		const onChange = vi.fn(() => {
			expect(control(part).element()).toHaveAttribute(target.attribute, target.on);
		});
		render(ControllableRootsHarness, { part, mode: 'parent', onChange });
		await expect.element(control(part)).toHaveAttribute(target.attribute, 'false');
		(page.getByRole('button', { name: 'Set value' }).element() as HTMLElement).click();
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('a default-only render shows the default and does not notify', async () => {
		const onChange = vi.fn();
		render(ControllableRootsHarness, { part, mode: 'default', onChange });
		await expect.element(control(part)).toHaveAttribute(target.attribute, target.on);
		expect(onChange).not.toHaveBeenCalled();
	});
}
