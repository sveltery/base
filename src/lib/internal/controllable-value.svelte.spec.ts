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

	it('still reports the next parent value after a round trip in one tick', async () => {
		render(ControllableValueHarness, { mode: 'flip' });
		await page.getByTestId('flip').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		await page.getByTestId('parent-c').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('c');
		expect(text('log')).toBe('["b","a","c"]');
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
	});

	it('falls back to the default when a controlled value is cleared', async () => {
		render(ControllableValueHarness, { mode: 'clear' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('a');
		await page.getByTestId('clear').click();
		await expect.element(page.getByTestId('value')).toHaveTextContent('fallback');
		expect(text('log')).toBe('["fallback"]');
	});
});
