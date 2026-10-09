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
		let release!: () => void;
		const finished = new Promise<void>((resolve) => {
			release = resolve;
		});
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

		await expect.poll(() => saw).toBe(true);
		const queued: Array<() => void> = [];
		const original = queueMicrotask;
		queueMicrotask = (fn) => {
			queued.push(fn);
		};
		try {
			release();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			expect(done).toBe(0);
			expect(queued.length).toBeGreaterThan(0);
		} finally {
			queueMicrotask = original;
		}
		for (const fn of queued) fn();
		expect(done).toBe(1);
		element.remove();
	});
});
