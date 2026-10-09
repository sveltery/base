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

	it('runs batched completions in one turn', async () => {
		function arm(label: string, log: string[]) {
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
			render(OpenChangeHarness, {
				open: false,
				batch: true,
				element,
				onComplete: () => {
					log.push(label);
				}
			});
			return {
				element,
				get saw() {
					return saw;
				},
				get notify() {
					return notify;
				}
			};
		}

		const log: string[] = [];
		const first = arm('first', log);
		const second = arm('second', log);
		await expect
			.poll(() => first.saw && second.saw && first.notify != null && second.notify != null)
			.toBe(true);
		const queue = globalThis.queueMicrotask.bind(globalThis);
		const beforeEachTask: number[] = [];
		globalThis.queueMicrotask = (callback) => {
			queue(() => {
				beforeEachTask.push(log.length);
				callback();
			});
		};
		try {
			first.notify?.();
			second.notify?.();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
		} finally {
			globalThis.queueMicrotask = queue;
		}
		expect(log).toEqual(['first', 'second']);
		expect(beforeEachTask).toContain(0);
		expect(beforeEachTask).not.toContain(1);
		first.element.remove();
		second.element.remove();
	});
});
