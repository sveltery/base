import { page, userEvent } from 'vitest/browser';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectHarness from '../../tests/SelectHarness.svelte';

it('smoke', async () => {
	const onValueChange = (v: unknown, d: { reason: string; event: Event }) => console.log('change', v, d.reason, d.event?.type, new Error().stack?.split('\n').slice(2,9).join('\n'));
	render(SelectHarness, {
		root: { onValueChange, name: 'fruit' },
		items: [{ value: 'a', text: 'Apple' }, { value: 'b', text: 'Banana' }],
		valueProps: { placeholder: 'Pick' }
	});
	const trigger = page.getByTestId('trigger');
	await expect.element(trigger).toHaveTextContent('Pick');
	await userEvent.click(trigger);
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await userEvent.click(page.getByRole('option', { name: 'Banana' }));
	await expect.element(trigger).toHaveTextContent('b');
	await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(page.getByRole('listbox')).toBeVisible();
	await expect.element(page.getByRole('option', { name: 'Banana' })).toHaveFocus();
	await userEvent.keyboard('{ArrowUp}');
	await expect.element(page.getByRole('option', { name: 'Apple' })).toHaveFocus();
	await userEvent.keyboard('{Enter}');
	for (let i = 0; i < 5; i++) {
		console.log('state', (document.querySelector('input[name="fruit"]') as HTMLInputElement).value, document.querySelector('[data-testid=value]')?.textContent, document.activeElement?.outerHTML.slice(0, 80));
		await new Promise((r) => setTimeout(r, 50));
	}
	await expect.element(trigger).toHaveTextContent('a');
	await expect.element(trigger).toHaveFocus();
	expect((document.querySelector('input[name="fruit"]') as HTMLInputElement).value).toBe('a');
});
