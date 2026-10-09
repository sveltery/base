import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OpenChangeHarness from '../../tests/OpenChangeHarness.svelte';

describe('useOpenChangeComplete', () => {
	it('waits for data-starting-style to leave when open is true', async () => {
		const element = document.createElement('div');
		element.setAttribute('data-starting-style', '');
		document.body.append(element);
		let done = 0;
		render(OpenChangeHarness, {
			open: true,
			element,
			onComplete: () => {
				done += 1;
			}
		});

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(done).toBe(0);

		element.removeAttribute('data-starting-style');
		await expect.poll(() => done).toBe(1);
		element.remove();
	});

	it('does not wait on data-starting-style when open is false', async () => {
		const element = document.createElement('div');
		element.setAttribute('data-starting-style', '');
		document.body.append(element);
		let done = 0;
		render(OpenChangeHarness, {
			open: false,
			element,
			onComplete: () => {
				done += 1;
			}
		});

		await expect.poll(() => done).toBe(1);
		element.remove();
	});

	it('waits for the batched microtask when batch is true', async () => {
		const element = document.createElement('div');
		let notify: (() => void) | undefined;
		const finished = {
			then(onFulfilled?: (() => void) | null) {
				if (onFulfilled) notify = onFulfilled;
				return Promise.resolve();
			}
		};
		let saw = false;
		element.getAnimations = () => {
			saw = true;
			return [{ finished, pending: false, playState: 'finished' }] as unknown as ReturnType<
				HTMLElement['getAnimations']
			>;
		};
		let done = 0;
		render(OpenChangeHarness, {
			open: false,
			batch: true,
			element,
			onComplete: () => {
				done += 1;
			}
		});

		await expect.poll(() => saw && notify != null).toBe(true);
		notify?.();
		await Promise.resolve();
		expect(done).toBe(0);
		await Promise.resolve();
		expect(done).toBe(1);
		element.remove();
	});
});
