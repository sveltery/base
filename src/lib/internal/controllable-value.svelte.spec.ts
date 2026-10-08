import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ControllableValueHarness from '../../tests/ControllableValueHarness.svelte';

function text(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

describe('createControllableValue', () => {
	it('writes the first local value into an empty bind', async () => {
		render(ControllableValueHarness, { mode: 'bind' });
		await expect.element(page.getByTestId('prop')).toHaveTextContent('none');
		expect(text('log')).toBe('[]');
		await page.getByTestId('set-b').click();
		await expect.element(page.getByTestId('prop')).toHaveTextContent('b');
		await expect.element(page.getByTestId('value')).toHaveTextContent('b');
		expect(text('log')).toBe('["b"]');
	});

	it('still reports the next parent value after a rejected write', async () => {
		render(ControllableValueHarness, { mode: 'reject' });
		await page.getByTestId('set-b').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		await page.getByTestId('parent-c').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('c');
		expect(text('log')).toBe('["c"]');
	});

	it('keeps details with the value they were written for', async () => {
		render(ControllableValueHarness, { mode: 'flip' });
		await page.getByTestId('set-b-details').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('b');
		expect(text('log')).toBe('["b"]');
		expect(text('reasons')).toBe('["go"]');

		await page.getByTestId('set-same-details').click();
		expect(text('log')).toBe('["b"]');
		expect(text('reasons')).toBe('["go"]');
	});

	it('does not notify a round trip back to the current value', async () => {
		render(ControllableValueHarness, { mode: 'flip' });
		await page.getByTestId('round-trip-details').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		expect(text('log')).toBe('[]');
		expect(text('reasons')).toBe('[]');
	});

	it('does not attach a write’s details to a later parent value', async () => {
		render(ControllableValueHarness, { mode: 'flip' });
		await page.getByTestId('set-then-parent').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('c');
		expect(text('log')).toBe('["c"]');
		expect(text('reasons')).toBe('[""]');
	});

	it('still reports the next parent value after a round trip in one tick', async () => {
		render(ControllableValueHarness, { mode: 'flip' });
		await page.getByTestId('flip').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		await page.getByTestId('parent-c').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('c');
		// The notice runs after the turn settles, so the round trip back to the
		// current value does not emit. The following parent write still does.
		expect(text('log')).toBe('["c"]');
	});

	it('uses the value a parent setter keeps', async () => {
		render(ControllableValueHarness, { mode: 'lower' });
		await page.getByTestId('set-mixed').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('ab');
		await expect.element(page.getByTestId('prop')).toHaveTextContent('ab');
		expect(text('log')).toBe('["ab"]');
	});

	it('does not wake an effect that iterates a $state array', async () => {
		render(ControllableValueHarness, { mode: 'proxy' });
		await expect.poll(() => text('runs')).toBe('1');
		await page.getByTestId('set-proxy').click();
		await expect.element(page.getByTestId('prop')).not.toHaveTextContent('none');
		expect(text('runs')).toBe('1');
	});

	it('leaves no symbol keys on a plain object, an array, or a class instance', async () => {
		render(ControllableValueHarness, { mode: 'plain' });
		await page.getByTestId('set-plain').click();
		await expect.element(page.getByTestId('same')).toHaveTextContent('yes');
		expect(text('symbols')).toBe('0,0,0');
		expect(text('copy-symbols')).toBe('0,0,0,0');
	});

	it('throws when a non-writable property is defined on $state', async () => {
		render(ControllableValueHarness, { mode: 'bind' });
		await expect.element(page.getByTestId('proxy-throws')).toHaveTextContent('threw');
	});

	it('falls back to the default when a controlled value is cleared', async () => {
		render(ControllableValueHarness, { mode: 'clear' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		await page.getByTestId('clear').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('fallback');
		expect(text('log')).toBe('["fallback"]');
	});
});
