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
		async function microtasksUntilDone(batch: boolean) {
			const element = document.createElement('div');
			let notify: (() => void) | undefined;
			const finished = new Promise<void>((resolve) => (notify = resolve));
			let read = false;
			element.getAnimations = () => {
				read = true;
				return [{ finished, pending: false, playState: 'finished' }] as unknown as ReturnType<
					HTMLElement['getAnimations']
				>;
			};
			let ticks = 0;
			let doneAt = -1;
			const view = render(OpenChangeHarness, {
				open: false,
				batch,
				element,
				onComplete: () => {
					doneAt = ticks;
				}
			});

			await expect.poll(() => read).toBe(true);
			const tick = () => {
				ticks += 1;
				if (doneAt < 0 && ticks < 20) queueMicrotask(tick);
			};
			notify?.();
			queueMicrotask(tick);
			await expect.poll(() => doneAt).toBeGreaterThanOrEqual(0);
			view.unmount();
			return doneAt;
		}

		const unbatched = await microtasksUntilDone(false);
		expect(await microtasksUntilDone(true)).toBe(unbatched + 1);
	});
});
