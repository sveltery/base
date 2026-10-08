import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CompositeRootHarness from '../../tests/CompositeRootHarness.svelte';

function stops(role: string) {
	return [...document.querySelectorAll(`[role="${role}"]`)].filter(
		(element) => element.getAttribute('tabindex') === '0'
	);
}

describe('composite root', () => {
	it('follows DOM order after a keyed reorder', async () => {
		render(CompositeRootHarness, { scenario: 'reorder' });
		const item = (name: string) => page.getByRole('button', { name, exact: true }).element();
		item('a').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(item('b'));

		await userEvent.click(page.getByRole('button', { name: 'Reverse' }).element());
		item('a').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(item('c'));
	});

	it('moves the radio tab stop when the parent changes the value', async () => {
		render(CompositeRootHarness, { scenario: 'radio-external' });
		await userEvent.click(page.getByRole('button', { name: 'Set B' }).element());
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(page.getByRole('radio', { name: 'B' }).element());
	});

	it('keeps one tab stop after every tab remounts', async () => {
		render(CompositeRootHarness, { scenario: 'tabs-remount' });
		expect(stops('tab')).toHaveLength(1);
		expect(stops('tab')[0]?.textContent).toBe('B');
		const toggle = page.getByRole('button', { name: 'Toggle tabs' }).element();
		await userEvent.click(toggle);
		expect(document.querySelectorAll('[role="tab"]')).toHaveLength(0);
		await userEvent.click(toggle);
		expect(stops('tab')).toHaveLength(1);
	});

	it('registers a tab once when disabled changes', async () => {
		render(CompositeRootHarness, { scenario: 'tabs-register' });
		const count = page.getByTestId('registrations');
		await expect.element(count).toHaveTextContent('2');
		await userEvent.click(page.getByRole('button', { name: 'Disable A' }).element());
		await expect
			.element(page.getByRole('tab', { name: 'A' }))
			.toHaveAttribute('aria-disabled', 'true');
		await expect.element(count).toHaveTextContent('2');
	});

	it('does not activate a toolbar link from Space', async () => {
		render(CompositeRootHarness, { scenario: 'toolbar-link' });
		page.getByRole('link', { name: 'Docs' }).element().focus();
		await userEvent.keyboard('{Space}');
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('0');
	});

	it('keeps the activation click when the value write is flushed', async () => {
		render(CompositeRootHarness, { scenario: 'radio-flush' });
		await userEvent.keyboard('{Shift>}');
		await userEvent.click(page.getByRole('radio', { name: 'A' }).element());
		await userEvent.keyboard('{/Shift}');
		await expect
			.element(page.getByRole('radio', { name: 'A' }))
			.toHaveAttribute('aria-checked', 'true');
		expect(JSON.parse(page.getByTestId('flush').element().textContent ?? '[]')).toEqual([
			{ value: 'a', shiftKey: true }
		]);
	});
});
