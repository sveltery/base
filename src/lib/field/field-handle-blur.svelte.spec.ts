// A bound Field reports blur to its handle, for sources that track touched themselves.
// No Base UI equivalent.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BlurHandleHarness from '../../tests/BlurHandleHarness.svelte';
import type { FieldHandle } from '../form/source.js';

function countingHandle(name: string) {
	const handle = {
		blurs: 0,
		as: () => ({ name }),
		issues: () => undefined,
		value: () => undefined,
		set: () => undefined,
		touched: () => false,
		dirty: () => false,
		blur() {
			handle.blurs += 1;
		}
	} satisfies FieldHandle & { blurs: number };
	return handle;
}

describe('FieldHandle blur', () => {
	for (const control of ['input', 'checkbox'] as const) {
		it(`is called each time a bound ${control === 'input' ? 'Field.Control' : 'Checkbox'} loses focus`, async () => {
			const handle = countingHandle(control === 'input' ? 'email' : 'b:agree');
			render(BlurHandleHarness, { handle, control });

			await userEvent.click(page.getByTestId('control'));
			expect(handle.blurs).toBe(0);
			await userEvent.click(page.getByRole('button', { name: 'Elsewhere' }));
			expect(handle.blurs).toBe(1);

			await userEvent.click(page.getByTestId('control'));
			await userEvent.tab();
			expect(handle.blurs).toBe(2);
		});
	}

	it('leaves a Kit-style handle alone, whose proxy answers `blur` with another field', async () => {
		const errors: unknown[] = [];
		const onError = (event: ErrorEvent) => errors.push(event.error);
		window.addEventListener('error', onError);
		const methods: Record<string, unknown> = {
			as: () => ({ name: 'email' }),
			issues: () => undefined,
			value: () => undefined,
			set: () => undefined,
			touched: () => false,
			dirty: () => false
		};
		const handle = new Proxy(methods, {
			get: (target, key) => (typeof key === 'string' && key in target ? target[key] : {})
		}) as unknown as FieldHandle;
		render(BlurHandleHarness, { handle, control: 'input' });

		await userEvent.click(page.getByTestId('control'));
		await userEvent.click(page.getByRole('button', { name: 'Elsewhere' }));
		window.removeEventListener('error', onError);

		expect(errors).toEqual([]);
		await expect.element(page.getByTestId('control')).toHaveAttribute('data-touched', '');
	});
});
