// Assertions follow Base UI v1.9.0 packages/react/src/toast/createToastManager.test.tsx and
// packages/react/src/toast/useToastManager.test.tsx (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Upstream clicks buttons that call the manager. These tests call the manager the harness hands
// over, which is the same call. `useToastManager` is `getToastManager`. A custom list that prints
// `toast.type` reads the root's `data-type` instead.
import { flushSync, tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToastDialogHarness from '../../tests/ToastDialogHarness.svelte';
import {
	advance,
	allByTestId,
	byTestId,
	click,
	closeButton,
	disableAnimations,
	renderToasts,
	textOf,
	useFakeClock
} from '../../tests/toast.js';
import { Toast } from './index.js';
import type { ToastObject } from './types.js';

disableAnimations();
useFakeClock();

function roots() {
	return allByTestId('root');
}

describe('createToastManager', () => {
	describe('add', () => {
		it('adds a toast', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			expect(byTestId('title')).toBe(null);

			toastManager.add({ title: 'title' });
			await tick();
			expect(textOf('title')).toBe('title');

			await advance(5000);
			expect(byTestId('title')).toBe(null);
		});

		it('upserts a toast when adding with an existing id', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const firstToastId = toastManager.add({ id: 'save', title: 'Saving…', timeout: 1000 });
			await tick();
			expect(textOf('title')).toBe('Saving…');
			expect(roots()).toHaveLength(1);

			await advance(900);

			const secondToastId = toastManager.add({ id: 'save', title: 'Saved', timeout: 1000 });
			await tick();

			expect(firstToastId).toBe('save');
			expect(secondToastId).toBe('save');
			expect(textOf('title')).toBe('Saved');
			expect(roots()).toHaveLength(1);

			await advance(200);
			expect(textOf('title')).toBe('Saved');

			await advance(800);
			expect(byTestId('title')).toBe(null);
		});
	});

	describe('promise', () => {
		it('adds a toast with the loading state that is updated with the success state', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const result = toastManager.promise(
				new Promise((resolve) => setTimeout(() => resolve('success'), 1000)),
				{ loading: 'loading', success: 'success', error: 'error' }
			);
			await tick();
			expect(textOf('description')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('success');
			await expect(result).resolves.toBe('success');
		});

		it('does not inherit a loading timeout when success does not specify one', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			toastManager.promise(new Promise((resolve) => setTimeout(() => resolve('success'), 1000)), {
				loading: { description: 'loading', timeout: 0 },
				success: { description: 'success' },
				error: 'error'
			});
			await tick();
			expect(textOf('description')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('success');

			await advance(5000);
			expect(byTestId('description')).toBe(null);
		});

		it('adds a toast with the loading state that is updated with the error state', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const result = toastManager.promise(Promise.reject(new Error('error')), {
				loading: 'loading',
				success: 'success',
				error: 'error'
			});
			await expect(result).rejects.toThrow('error');
			await tick();

			expect(textOf('description')).toBe('error');
		});

		it('does not reopen a dismissed promise toast when it resolves', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			let resolvePromise!: (value: string) => void;
			toastManager.promise(
				new Promise<string>((resolve) => {
					resolvePromise = resolve;
				}),
				{ loading: 'loading', success: 'success', error: 'error' }
			);
			await tick();
			expect(textOf('description')).toBe('loading');

			await click(closeButton());
			resolvePromise('success');
			await advance(0);

			expect(byTestId('title')).toBe(null);
			expect(roots()).toHaveLength(0);
		});
	});

	describe('update', () => {
		it('updates a toast', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'title' });
			toastManager.update(toastId, { title: 'updated' });
			await tick();

			expect(textOf('title')).toBe('updated');
		});

		it('derives the update from the current toast when given a function', async () => {
			const toastManager = Toast.createToastManager<{ count: number }>();
			renderToasts({ toastManager });

			const updater = vi.fn((prevToast: ToastObject<{ count: number }>) => ({
				title: `${prevToast.title} updated`,
				data: { count: prevToast.data!.count + 1 }
			}));

			const toastId = toastManager.add({ title: 'title', data: { count: 1 } });
			toastManager.update(toastId, updater);
			await tick();

			expect(updater).toHaveBeenCalledTimes(1);
			expect(updater.mock.calls[0][0].data).toEqual({ count: 1 });
			expect(textOf('title')).toBe('title updated');
		});

		it('resets the auto-dismiss timer when updating with the same timeout value', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'title', timeout: 1000 });
			await tick();
			expect(textOf('title')).toBe('title');

			await advance(900);
			expect(textOf('title')).toBe('title');

			toastManager.update(toastId, { timeout: 1000 });

			await advance(200);
			expect(textOf('title')).toBe('title');

			await advance(800);
			expect(byTestId('title')).toBe(null);
		});

		it('resets the auto-dismiss timer when updating from 0 to a timeout, then updating with the same timeout again', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'title', timeout: 0 });
			await tick();
			expect(textOf('title')).toBe('title');

			toastManager.update(toastId, { timeout: 1000 });

			await advance(900);
			expect(textOf('title')).toBe('title');

			toastManager.update(toastId, { timeout: 1000 });

			await advance(200);
			expect(textOf('title')).toBe('title');

			await advance(800);
			expect(byTestId('title')).toBe(null);
		});

		it('auto-dismisses when updating timeout from 0 to a positive value', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'title', timeout: 0 });
			await tick();
			expect(textOf('title')).toBe('title');

			toastManager.update(toastId, { timeout: 1000 });
			await advance(1000);

			expect(byTestId('title')).toBe(null);
		});

		it('schedules a timer when updating a loading toast to a non-loading type', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'loading', type: 'loading' });
			await tick();
			expect(textOf('title')).toBe('loading');

			toastManager.update(toastId, { title: 'success', type: 'success', timeout: 1000 });
			await tick();
			expect(textOf('title')).toBe('success');

			await advance(1000);
			expect(byTestId('title')).toBe(null);
		});

		it('does not clear the auto-dismiss timer when updated twice before a re-render', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'loading', type: 'loading' });
			await tick();
			expect(textOf('title')).toBe('loading');

			toastManager.update(toastId, { type: 'success', timeout: 1000 });
			toastManager.update(toastId, { title: 'new' });
			await tick();
			expect(textOf('title')).toBe('new');

			await advance(1000);
			expect(byTestId('title')).toBe(null);
		});
	});

	describe('close', () => {
		it('closes a toast', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const toastId = toastManager.add({ title: 'title' });
			await tick();
			expect(textOf('title')).toBe('title');

			toastManager.close(toastId);
			await tick();
			expect(byTestId('title')).toBe(null);
		});

		it('closes all toasts', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			for (let index = 0; index < 5; index += 1) toastManager.add({ title: 'title' });
			await tick();
			expect(roots()).toHaveLength(5);

			toastManager.close();
			await tick();
			expect(byTestId('title')).toBe(null);
		});

		it('does not call onClose when closing toasts that are already ending', async () => {
			const toastManager = Toast.createToastManager();
			renderToasts({ toastManager });

			const onCloseSpy1 = vi.fn(() => toastManager.close());
			const onCloseSpy2 = vi.fn();

			const toastId1 = toastManager.add({ title: 'toast 1', onClose: onCloseSpy1 });
			toastManager.add({ title: 'toast 2', onClose: onCloseSpy2 });
			await tick();

			toastManager.close(toastId1);
			await tick();

			expect(onCloseSpy1).toHaveBeenCalledTimes(1);
			expect(onCloseSpy2).toHaveBeenCalledTimes(1);
			expect(roots()).toHaveLength(0);
		});
	});
});

describe('getToastManager', () => {
	describe('add', () => {
		it('adds a toast to the viewport that auto-dismisses after 5s by default', async () => {
			renderToasts();

			await click(page.getByRole('button', { name: 'add' }).element() as HTMLElement);
			expect(roots()).toHaveLength(1);
			expect(textOf('title')).toBe('title');

			await advance(4999);
			expect(roots()).toHaveLength(1);

			await advance(1);
			expect(roots()).toHaveLength(0);
		});

		it('keeps multiple providers isolated when one provider updates', async () => {
			const first = renderToasts();
			const second = renderToasts();

			const firstId = first.manager.add({ title: 'First toast' });
			second.manager.add({ title: 'Second toast' });
			await tick();

			expect(textOf('title', first.view.container)).toBe('First toast');
			expect(textOf('title', second.view.container)).toBe('Second toast');

			first.manager.update(firstId, { title: 'First toast updated' });
			await tick();

			expect(textOf('title', first.view.container)).toBe('First toast updated');
			expect(textOf('title', second.view.container)).toBe('Second toast');
			expect(first.manager.toasts).toHaveLength(1);
			expect(second.manager.toasts).toHaveLength(1);
		});

		it('replaces a closing toast when adding again with the same id', async () => {
			const { manager } = renderToasts();

			const toastId = manager.add({ id: 'save', title: 'Saving…', timeout: 0 });
			await tick();
			expect(textOf('title')).toBe('Saving…');
			expect(roots()).toHaveLength(1);

			manager.close(toastId);
			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();

			expect(textOf('title')).toBe('Saved');
			expect(roots()).toHaveLength(1);
			expect(manager.toasts).toHaveLength(1);
		});

		it('does not call onRemove when replacing an ending toast', async () => {
			const onRemoveSpy = vi.fn();
			const { manager } = renderToasts({ viewport: false });

			manager.add({ id: 'save', title: 'Saving…', timeout: 0, onRemove: onRemoveSpy });
			expect(manager.toasts).toHaveLength(1);

			manager.close('save');
			manager.add({ id: 'save', title: 'Saved', timeout: 0 });

			expect(manager.toasts).toHaveLength(1);
			expect(manager.toasts[0].title).toBe('Saved');
			expect(onRemoveSpy).toHaveBeenCalledTimes(0);
		});

		it('calls onRemove once after replacing an ending toast and later removing the replacement', async () => {
			const onRemoveSpy = vi.fn();
			const { manager, view } = renderToasts({ viewport: false });

			manager.add({ id: 'save', title: 'Saving…', timeout: 0, onRemove: onRemoveSpy });
			manager.close('save');
			manager.add({ id: 'save', title: 'Saved', timeout: 0, onRemove: onRemoveSpy });

			expect(manager.toasts).toHaveLength(1);
			expect(onRemoveSpy).toHaveBeenCalledTimes(0);

			await view.rerender({ viewport: true });
			manager.close('save');
			await tick();

			expect(onRemoveSpy).toHaveBeenCalledTimes(1);
			expect(manager.toasts).toHaveLength(0);
		});

		it('ignores transitionStatus when upserting an existing toast', async () => {
			const { manager } = renderToasts({ viewport: false });

			manager.add({ id: 'save', title: 'Saving…', timeout: 0 });
			expect(manager.toasts[0].title).toBe('Saving…');
			expect(manager.toasts[0].transitionStatus).toBe('starting');

			manager.add({ id: 'save', title: 'Saved', timeout: 0, transitionStatus: 'ending' });
			expect(manager.toasts[0].title).toBe('Saved');
			expect(manager.toasts[0].transitionStatus).toBe('starting');
		});

		it('increments updateKey when adding again with the same id', async () => {
			const { manager } = renderToasts({ viewport: false });

			manager.add({ id: 'save', title: 'Draft saved', timeout: 0 });
			expect(manager.toasts[0].updateKey).toBe(0);

			manager.add({ id: 'save', title: 'Draft saved', timeout: 0 });
			expect(manager.toasts[0].updateKey).toBe(1);
		});

		describe('option: timeout', () => {
			it('dismisses the toast after the specified timeout', async () => {
				const { manager } = renderToasts();

				manager.add({ title: 'test', timeout: 1000 });
				await tick();
				expect(roots()).toHaveLength(1);

				await advance(1000);
				expect(roots()).toHaveLength(0);
			});
		});

		describe('option: title', () => {
			it('renders the title', async () => {
				const { manager } = renderToasts();

				manager.add({ title: 'title', description: 'description' });
				await tick();

				expect(textOf('title')).toBe('title');
			});
		});

		describe('option: description', () => {
			it('renders the description', async () => {
				const { manager } = renderToasts();

				manager.add({ title: 'title', description: 'description' });
				await tick();

				expect(textOf('description')).toBe('description');
			});
		});

		describe('option: type', () => {
			it('renders the type', async () => {
				const { manager } = renderToasts();

				manager.add({ title: 'test', type: 'success' });
				await tick();

				expect(textOf('title')).toBe('test');
				expect(byTestId('root')?.getAttribute('data-type')).toBe('success');
				expect(byTestId('title')?.getAttribute('data-type')).toBe('success');
			});
		});

		describe('option: onClose', () => {
			it('calls onClose when the toast is closed', async () => {
				const onCloseSpy = vi.fn();
				const { manager } = renderToasts();

				const toastId = manager.add({ title: 'test', onClose: onCloseSpy });
				await tick();
				expect(onCloseSpy).toHaveBeenCalledTimes(0);

				manager.close(toastId);
				expect(onCloseSpy).toHaveBeenCalledTimes(1);
			});

			it('calls onClose when the toast auto-dismisses', async () => {
				const onCloseSpy = vi.fn();
				const { manager } = renderToasts();

				manager.add({ title: 'test', timeout: 1000, onClose: onCloseSpy });
				await tick();
				expect(onCloseSpy).toHaveBeenCalledTimes(0);

				await advance(1000);
				expect(onCloseSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('option: onRemove', () => {
			it('calls onRemove when the toast is removed', async () => {
				const onRemoveSpy = vi.fn();
				const { manager } = renderToasts();

				const toastId = manager.add({ title: 'test', onRemove: onRemoveSpy });
				await tick();
				expect(onRemoveSpy).toHaveBeenCalledTimes(0);

				manager.close(toastId);
				await tick();
				expect(onRemoveSpy).toHaveBeenCalledTimes(1);
				expect(roots()).toHaveLength(0);
			});
		});

		describe('option: priority', () => {
			it('applies correct ARIA attributes for high priority toasts', async () => {
				const { manager } = renderToasts();

				manager.add({ title: 'high priority', priority: 'high' });
				await tick();

				const highRoot = byTestId('root')!;
				expect(highRoot.getAttribute('role')).toBe('alertdialog');
				expect(highRoot.getAttribute('aria-modal')).toBe('false');

				const alerts = document.querySelectorAll('[role="alert"]');
				expect(alerts).toHaveLength(1);
				expect(alerts[0].getAttribute('aria-atomic')).toBe('true');
				expect(alerts[0].children[0].textContent).toBe('high priority');
				expect(alerts[0].children[1].textContent).toBe('');

				await click(closeButton());
				expect(document.querySelectorAll('[role="alert"]')).toHaveLength(0);
			});
		});
	});

	describe('promise', () => {
		function addPromise(
			promise: ReturnType<typeof renderToasts>['manager']['promise'],
			value: Promise<unknown>,
			options: Parameters<typeof promise>[1]
		) {
			promise(value, options).catch(() => {});
		}

		function delayed(settle: 'resolve' | 'reject', value: unknown, ms = 1000) {
			return new Promise((resolve, reject) => {
				setTimeout(() => (settle === 'resolve' ? resolve(value) : reject(value)), ms);
			});
		}

		it('displays success state as description after promise resolves', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, delayed('resolve', 'success'), {
				loading: 'loading',
				success: 'success',
				error: 'error'
			});
			await tick();
			expect(textOf('description')).toBe('loading');
			expect(byTestId('root')?.getAttribute('data-type')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('success');
			expect(byTestId('root')?.getAttribute('data-type')).toBe('success');
		});

		it('displays error state as description after promise rejects', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, delayed('reject', new Error('error')), {
				loading: 'loading',
				success: 'success',
				error: 'error'
			});
			await tick();
			expect(textOf('description')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('error');
			expect(byTestId('root')?.getAttribute('data-type')).toBe('error');
		});

		it('passes data when success is a function', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, Promise.resolve('test success'), {
				loading: 'loading',
				success: (data) => `${data}`,
				error: 'error'
			});
			// The promise settles on the next microtask, so read the loading state before it does.
			flushSync();
			expect(textOf('description')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('test success');
		});

		it('accepts a function that returns full options for the success state', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, Promise.resolve('everything'), {
				loading: 'loading',
				success: (data) => ({ title: `saved ${data}`, description: 'done', timeout: 2000 }),
				error: 'error'
			});

			await advance(0);
			expect(textOf('title')).toBe('saved everything');
			expect(textOf('description')).toBe('done');

			// The `timeout` from the resolved options object is honored too.
			await advance(1999);
			expect(roots()).toHaveLength(1);

			await advance(2);
			expect(roots()).toHaveLength(0);
		});

		it('passes data when error is a function', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, Promise.reject(new Error('test error')), {
				loading: 'loading',
				success: 'success',
				error: (error: Error) => `${error.message}`
			});
			flushSync();
			expect(textOf('description')).toBe('loading');

			await advance(1000);
			expect(textOf('description')).toBe('test error');
		});

		it('supports custom options', async () => {
			const { manager } = renderToasts();

			addPromise(manager.promise, Promise.resolve('success'), {
				loading: { title: 'loading title', description: 'loading description' },
				success: 'success',
				error: 'error'
			});
			flushSync();

			expect(textOf('title')).toBe('loading title');
			expect(textOf('description')).toBe('loading description');
		});

		it('does not reopen a dismissed promise toast when it resolves', async () => {
			const { manager } = renderToasts();

			let resolvePromise!: (value: string) => void;
			addPromise(
				manager.promise,
				new Promise<string>((resolve) => {
					resolvePromise = resolve;
				}),
				{ loading: 'loading', success: 'success', error: 'error' }
			);
			await tick();
			expect(textOf('description')).toBe('loading');

			await click(closeButton());
			resolvePromise('success');
			await advance(0);

			expect(roots()).toHaveLength(0);
		});

		describe('timeout handling', () => {
			it('auto-dismisses success toast after default timeout when promise resolves', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: 'loading',
					success: 'success',
					error: 'error'
				});
				await tick();
				expect(textOf('description')).toBe('loading');

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(4999);
				expect(roots()).toHaveLength(1);

				await advance(1);
				expect(roots()).toHaveLength(0);
			});

			it('auto-dismisses error toast after default timeout when promise rejects', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('reject', new Error('error')), {
					loading: 'loading',
					success: 'success',
					error: 'error'
				});
				await tick();
				expect(textOf('description')).toBe('loading');

				await advance(1000);
				expect(textOf('description')).toBe('error');

				await advance(5000);
				expect(roots()).toHaveLength(0);
			});

			it('uses custom timeout from success options when promise resolves', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: 'loading',
					success: { description: 'success', timeout: 2000 },
					error: 'error'
				});

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(1000);
				expect(roots()).toHaveLength(1);

				await advance(1000);
				expect(roots()).toHaveLength(0);
			});

			it('uses custom timeout from error options when promise rejects', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('reject', new Error('error')), {
					loading: 'loading',
					success: 'success',
					error: { description: 'error', timeout: 3000 }
				});

				await advance(1000);
				expect(textOf('description')).toBe('error');

				await advance(2000);
				expect(roots()).toHaveLength(1);

				await advance(1000);
				expect(roots()).toHaveLength(0);
			});

			it('uses provider timeout when no custom timeout is specified', async () => {
				const { manager } = renderToasts({ timeout: 1000 });

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: 'loading',
					success: 'success',
					error: 'error'
				});

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(1000);
				expect(roots()).toHaveLength(0);
			});

			it('does not inherit a loading timeout when success does not specify one', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: { description: 'loading', timeout: 0 },
					success: 'success',
					error: 'error'
				});
				await tick();
				expect(textOf('description')).toBe('loading');

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(5000);
				expect(roots()).toHaveLength(0);
			});

			it('does not auto-dismiss when timeout is set to 0', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: 'loading',
					success: { description: 'success', timeout: 0 },
					error: 'error'
				});

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(10000);
				expect(roots()).toHaveLength(1);
			});

			it('pauses timers when hovering over toast', async () => {
				const { manager } = renderToasts();

				addPromise(manager.promise, delayed('resolve', 'success'), {
					loading: 'loading',
					success: { description: 'success', timeout: 3000 },
					error: 'error'
				});

				await advance(1000);
				expect(textOf('description')).toBe('success');

				await advance(1000);

				await userEvent.hover(page.getByTestId('root'));
				await advance(5000);
				expect(roots()).toHaveLength(1);

				await userEvent.unhover(page.getByTestId('root'));
				await advance(1999);
				expect(roots()).toHaveLength(1);

				await advance(1);
				expect(roots()).toHaveLength(0);
			});
		});
	});

	describe('update', () => {
		it('updates the toast', async () => {
			const { manager } = renderToasts();

			const toastId = manager.add({ title: 'test' });
			await tick();
			expect(textOf('title')).toBe('test');

			manager.update(toastId, { title: 'updated' });
			await tick();
			expect(textOf('title')).toBe('updated');
		});

		it('increments updateKey when updating a toast', async () => {
			const { manager } = renderToasts({ viewport: false });

			const toastId = manager.add({ id: 'save', title: 'Draft saved', timeout: 0 });
			expect(manager.toasts[0].updateKey).toBe(0);

			manager.update(toastId, { title: 'Draft synced' });
			expect(manager.toasts[0].updateKey).toBe(1);
		});

		it('auto-dismisses when timeout changes from 0 to a positive value', async () => {
			const { manager } = renderToasts();

			const toastId = manager.add({ title: 'test', timeout: 0 });
			await tick();
			expect(roots()).toHaveLength(1);

			manager.update(toastId, { timeout: 1000 });
			await advance(1000);

			expect(roots()).toHaveLength(0);
		});

		it('schedules a timer when updating a loading toast to a non-loading type', async () => {
			const { manager } = renderToasts();

			const toastId = manager.add({ title: 'loading', type: 'loading' });
			await tick();
			expect(textOf('title')).toBe('loading');

			manager.update(toastId, { title: 'success', type: 'success', timeout: 1000 });
			await tick();
			expect(textOf('title')).toBe('success');

			await advance(1000);
			expect(roots()).toHaveLength(0);
		});
	});

	describe('close', () => {
		it('closes a toast', async () => {
			const { manager } = renderToasts();

			const toastId = manager.add({ title: 'test' });
			await tick();
			expect(roots()).toHaveLength(1);

			manager.close(toastId);
			await tick();
			expect(roots()).toHaveLength(0);
		});

		it('closes all toasts', async () => {
			const { manager } = renderToasts();

			for (let index = 0; index < 5; index += 1) manager.add({ title: 'test' });
			await tick();
			expect(roots()).toHaveLength(5);

			manager.close();
			await tick();
			expect(roots()).toHaveLength(0);
		});
	});

	describe('prop: timeout', () => {
		it('applies a changed timeout to toasts added afterwards', async () => {
			const { manager, view } = renderToasts({ timeout: 5000 });

			await view.rerender({ timeout: 1000 });
			manager.add({ title: 'test' });
			await tick();

			await advance(999);
			expect(roots()).toHaveLength(1);

			await advance(2);
			expect(roots()).toHaveLength(0);
		});
	});

	describe('prop: limit', () => {
		function limitedToast(title: string) {
			return byTestId(`toast-${title}`)!;
		}

		it('marks toasts as limited when the limit is exceeded', async () => {
			const { manager } = renderToasts({ limit: 2, rootTestId: 'title' });

			manager.add({ title: '1' });
			await tick();
			const toast1 = limitedToast('1');
			expect(toast1.hasAttribute('data-limited')).toBe(false);

			manager.add({ title: '2' });
			await tick();
			expect(limitedToast('2').hasAttribute('data-limited')).toBe(false);

			manager.add({ title: '3' });
			await tick();
			expect(limitedToast('3').hasAttribute('data-limited')).toBe(false);
			expect(toast1.hasAttribute('data-limited')).toBe(true);
			expect(toast1.inert).toBe(true);
		});

		it('unmarks toasts as limited when the limit is not exceeded', async () => {
			const { manager } = renderToasts({ limit: 2, rootTestId: 'title' });

			manager.add({ title: '1' });
			manager.add({ title: '2' });
			manager.add({ title: '3' });
			await tick();
			const toast1 = limitedToast('1');
			expect(toast1.hasAttribute('data-limited')).toBe(true);

			await click(closeButton(limitedToast('3')));

			expect(toast1.hasAttribute('data-limited')).toBe(false);
			expect(toast1.inert).toBe(false);
		});

		it('preserves limited state when upserting a limited toast', async () => {
			const { manager } = renderToasts({ limit: 1, rootTestId: 'title' });

			manager.add({ id: 'save', title: 'Saving…', timeout: 0 });
			await tick();
			const savingToast = limitedToast('Saving…');
			expect(savingToast.hasAttribute('data-limited')).toBe(false);

			manager.add({ id: 'other', title: 'Other toast', timeout: 0 });
			await tick();
			expect(savingToast.hasAttribute('data-limited')).toBe(true);
			expect(limitedToast('Other toast').hasAttribute('data-limited')).toBe(false);

			manager.add({ id: 'save', title: 'Saved', timeout: 0 });
			await tick();
			expect(limitedToast('Saved').hasAttribute('data-limited')).toBe(true);
			expect(limitedToast('Other toast').hasAttribute('data-limited')).toBe(false);
		});

		it('recomputes limited toasts when the limit prop changes', async () => {
			const { manager, view } = renderToasts({ limit: 1, rootTestId: 'title' });

			manager.add({ title: '1' });
			manager.add({ title: '2' });
			await tick();

			const toast1 = limitedToast('1');
			const toast2 = limitedToast('2');
			expect(toast2.hasAttribute('data-limited')).toBe(false);
			expect(toast1.hasAttribute('data-limited')).toBe(true);

			// Raising the limit un-limits the older toast.
			await view.rerender({ limit: 2 });
			expect(toast1.hasAttribute('data-limited')).toBe(false);

			// Lowering it again re-limits it.
			await view.rerender({ limit: 1 });
			expect(toast1.hasAttribute('data-limited')).toBe(true);
		});
	});

	describe('in dialog', () => {
		it('toasts in dialogs are accessible and not aria-hidden', async () => {
			render(ToastDialogHarness, {
				addOptions: { title: 'Toast in dialog', description: 'This toast is in a dialog' }
			});

			await click(page.getByRole('button', { name: 'open dialog' }).element() as HTMLElement);
			expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);

			await click(page.getByRole('button', { name: 'add' }).element() as HTMLElement);

			const toastRoot = byTestId('root')!;
			expect(toastRoot.getAttribute('aria-hidden')).toBe(null);
			expect(textOf('title')).toBe('Toast in dialog');
			expect(textOf('description')).toBe('This toast is in a dialog');
		});

		it('high priority toasts in dialogs have correct accessibility structure', async () => {
			render(ToastDialogHarness, {
				open: true,
				addOptions: {
					title: 'High priority toast',
					description: 'This is urgent',
					priority: 'high'
				}
			});
			await tick();

			await click(page.getByRole('button', { name: 'add' }).element() as HTMLElement);

			expect(byTestId('root')?.getAttribute('aria-hidden')).toBe('true');
			const alerts = document.querySelectorAll('[role="alert"]');
			expect(alerts).toHaveLength(1);
			expect(alerts[0].children[0].textContent).toBe('High priority toast');
			expect(alerts[0].children[1].textContent).toBe('This is urgent');
		});
	});
});
