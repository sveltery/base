// A nested dialog or popover that is already open when the parent portal mounts
// stays open. Base UI v1.8.0 (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c) keeps
// both open and leaves focus on the nested control.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DialogFixture from '../../routes/fixtures/dialog/DialogFixture.svelte';

async function frames(count = 3) {
	for (let index = 0; index < count; index += 1) {
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
		await tick();
	}
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent || '[]') as {
		open: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

function closed() {
	return calls().filter((call) => !call.open);
}

describe('Dialog nested popup already open', () => {
	it('keeps a nested dialog open when the outer portal first renders', async () => {
		render(DialogFixture, { scenario: 'nested-open' });
		await frames();

		expect(page.getByRole('dialog', { includeHidden: true }).elements()).toHaveLength(2);
		expect(closed()).toEqual([]);
		expect(document.activeElement).toBe(
			page.getByRole('button', { name: 'Nested inside' }).element()
		);
		expect(page.getByTestId('roots').element().textContent).toBe('bound');
		expect(page.getByTestId('popups').element().textContent).toBe('attached');
	});

	it('keeps a nested popover open when the outer portal first renders', async () => {
		render(DialogFixture, { scenario: 'nested-popover' });
		await frames();

		expect(page.getByRole('dialog', { includeHidden: true }).elements()).toHaveLength(2);
		expect(document.querySelector('[data-testid="nested-popup"]')).toBeTruthy();
		expect(closed()).toEqual([]);
		expect(document.activeElement).toBe(
			page.getByRole('button', { name: 'Nested inside' }).element()
		);
		expect(page.getByTestId('roots').element().textContent).toBe('bound');
		expect(page.getByTestId('popups').element().textContent).toBe('attached');
	});

	it('keeps a nested dialog open when the outer dialog opens onto it', async () => {
		render(DialogFixture, { scenario: 'nested-open', open: false });
		(page.getByRole('button', { name: 'Open', exact: true }).element() as HTMLElement).click();
		await frames();

		expect(page.getByRole('dialog', { includeHidden: true }).elements()).toHaveLength(2);
		expect(closed()).toEqual([]);
		expect(document.activeElement).toBe(
			page.getByRole('button', { name: 'Nested inside' }).element()
		);
	});

	it('keeps a nested dialog open when it is opened after the parent', async () => {
		render(DialogFixture, { scenario: 'nested-open', innerOpen: false });
		await frames();
		(page.getByRole('button', { name: 'Nested', exact: true }).element() as HTMLElement).click();
		await frames();

		expect(page.getByRole('dialog', { includeHidden: true }).elements()).toHaveLength(2);
		expect(closed()).toEqual([]);
	});
});
