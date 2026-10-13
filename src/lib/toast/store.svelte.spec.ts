// Assertions follow Base UI v1.9.0 packages/react/src/toast/store.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The store's lists are runes, so this runs in the browser project. Upstream seeds the state
// directly; here the toasts go in through `addToast`, oldest first, and are then marked mounted
// the way `Toast.Root` does. `syncProviderProps` is the provider's `limit` prop.
// The "re-pauses timers" cases run in Toast.svelte.spec.ts, where the pause comes from
// hovering the viewport or blurring the window instead of a direct `pauseTimers()` call.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastStore } from './store.svelte.js';
import type { ToastObject } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream's default, see types.ts
type SeedToast = Omit<ToastObject<any>, 'updateKey'>;

function createStore(toasts: SeedToast[], props: () => { timeout: number; limit: number }) {
	const store = new ToastStore(props);
	for (const toast of [...toasts].reverse()) {
		store.addToast(toast);
		store.updateToastInternal(toast.id, { transitionStatus: undefined });
	}
	return store;
}

function seed(toasts: SeedToast[]) {
	return createStore(toasts, () => ({ timeout: 0, limit: 3 }));
}

function ids(store: ToastStore) {
	return store.toasts.map((toast) => toast.id);
}

function expectToastMetadataToMatchToasts(store: ToastStore) {
	let visibleIndex = 0;
	let offsetY = 0;

	store.toasts.forEach((toast, index) => {
		const isEnding = toast.transitionStatus === 'ending';

		expect(store.toast(toast.id)).toBe(toast);
		expect(store.toastIndex(toast.id)).toBe(index);
		expect(store.toastOffsetY(toast.id)).toBe(offsetY);
		expect(store.toastVisibleIndex(toast.id)).toBe(isEnding ? -1 : visibleIndex);

		offsetY += toast.height || 0;
		if (!isEnding) visibleIndex += 1;
	});
}

describe('ToastStore', () => {
	it('keeps toast metadata synchronized after mutations', () => {
		const store = seed([
			{ id: 'newest', height: 30 },
			{ id: 'middle', height: 40 },
			{ id: 'oldest', height: 50 }
		]);

		expect(ids(store)).toEqual(['newest', 'middle', 'oldest']);
		expect(store.toastOffsetY('oldest')).toBe(70);
		expectToastMetadataToMatchToasts(store);

		store.updateToastInternal('middle', { height: 45 });
		expect(store.toastOffsetY('oldest')).toBe(75);
		expectToastMetadataToMatchToasts(store);

		store.closeToast('middle');
		expect(store.toast('middle')?.transitionStatus).toBe('ending');
		expect(store.toastVisibleIndex('middle')).toBe(-1);
		expect(store.toastVisibleIndex('oldest')).toBe(1);
		expectToastMetadataToMatchToasts(store);

		store.removeToast('middle', true);
		expect(ids(store)).toEqual(['newest', 'oldest']);
		expectToastMetadataToMatchToasts(store);

		store.addToast({ id: 'front', title: 'Front', timeout: 0 });
		expect(ids(store)).toEqual(['front', 'newest', 'oldest']);
		expect(store.toastOffsetY('newest')).toBe(0);
		expect(store.toastOffsetY('oldest')).toBe(30);
		expectToastMetadataToMatchToasts(store);
	});

	it('ignores height recalculations while a toast is transitioning out', () => {
		const store = seed([{ id: 'a', height: 40 }]);

		store.closeToast('a');
		expect(store.toast('a')?.transitionStatus).toBe('ending');

		// Mirrors the write `recalculateHeight` makes when a content observer fires: it always
		// includes `transitionStatus: undefined`. The ending toast must stay ending so the root
		// still removes it once its exit animation finishes.
		store.updateToastInternal('a', { height: 80, transitionStatus: undefined });

		const toast = store.toast('a');
		expect(toast?.transitionStatus).toBe('ending');
		expect(toast?.height).toBe(0);

		store.removeToast('a', true);
		expect(store.toast('a')).toBe(undefined);
	});

	it('ignores mutations that target an unknown toast', () => {
		const store = seed([{ id: 'a' }]);
		const toastsBefore = store.toasts;

		store.removeToast('missing');
		store.closeToast('missing');
		store.updateToast('missing', { title: 'nope' });

		expect(store.toasts).toBe(toastsBefore);
		expect(ids(store)).toEqual(['a']);
		expect(store.toast('a')?.transitionStatus).toBe(undefined);
	});

	it('replaces custom data wholesale when updating a toast', () => {
		const store = seed([{ id: 'a', data: { name: 'Draft', count: 1 } }]);

		const nextData = { count: 2 };
		store.updateToast('a', { data: nextData });
		expect(store.toast('a')?.data).toBe(nextData);

		store.updateToast('a', { title: 'Saved' });
		expect(store.toast('a')?.data).toBe(nextData);
		expect(store.toast('a')?.title).toBe('Saved');

		store.updateToast('a', { data: undefined });
		expect(store.toast('a')?.data).toBe(undefined);
	});

	it('derives the update from the current toast when given a function', () => {
		const store = seed([{ id: 'a', title: 'Draft', data: { name: 'Draft', count: 1 } }]);

		store.updateToast('a', (prevToast) => ({
			title: `${prevToast.title} (saved)`,
			data: { ...prevToast.data, count: 2 }
		}));
		const toast = store.toast('a');
		expect(toast?.title).toBe('Draft (saved)');
		expect(toast?.data).toEqual({ name: 'Draft', count: 2 });
		expect(toast?.updateKey).toBe(1);
	});

	it('passes a toast without custom data to the updater', () => {
		const store = seed([{ id: 'a' }]);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream's default
		const updater = vi.fn((_prevToast: ToastObject<any>) => ({ data: { name: 'Draft' } }));

		store.updateToast('a', updater);
		expect(updater).toHaveBeenCalledTimes(1);
		const prevToast = updater.mock.calls[0]?.[0];
		expect(prevToast?.id).toBe('a');
		expect(prevToast?.data).toBe(undefined);
		expect(store.toast('a')?.data).toEqual({ name: 'Draft' });
	});

	it('stores a function passed as custom data instead of calling it', () => {
		const store = seed([{ id: 'a', data: () => 'first' }]);
		const nextValue = () => 'second';

		store.updateToast('a', { data: nextValue });
		expect(store.toast('a')?.data).toBe(nextValue);
	});

	it('does not call the updater for a missing or ending toast', () => {
		const store = seed([{ id: 'a', data: { name: 'Draft' } }]);
		store.closeToast('a');
		expect(store.toast('a')?.transitionStatus).toBe('ending');

		const updater = vi.fn(() => ({}));
		store.updateToast('a', updater);
		store.updateToast('missing', updater);
		expect(updater).not.toHaveBeenCalled();
		expect(store.toast('a')?.data).toEqual({ name: 'Draft' });
	});

	it('keeps a toast added from inside an updater', () => {
		const store = seed([{ id: 'a', data: { count: 1 } }]);

		store.updateToast('a', () => {
			store.addToast({ id: 'b' });
			return { data: { count: 2 } };
		});
		expect(ids(store)).toEqual(['b', 'a']);
		expect(store.toast('a')?.data).toEqual({ count: 2 });
		expectToastMetadataToMatchToasts(store);
	});

	it('keeps a toast closed from inside its updater closed', () => {
		const store = seed([{ id: 'a', data: { count: 1 } }]);

		store.updateToast('a', () => {
			store.closeToast('a');
			return { data: { count: 2 } };
		});
		expect(store.toast('a')?.transitionStatus).toBe('ending');
		expect(store.toast('a')?.data).toEqual({ count: 1 });
	});

	it('stores a function as the value when re-adding a toast under an existing id', () => {
		const store = seed([]);
		const value = () => 'first';
		const nextValue = () => 'second';

		store.addToast({ id: 'a', data: value });
		store.addToast({ id: 'a', data: nextValue });
		expect(store.toast('a')?.data).toBe(nextValue);
	});

	it('replaces custom data when re-adding a toast under an existing id', () => {
		const store = seed([]);

		store.addToast({ id: 'a', data: { status: 'error', errorCode: 42 } });
		store.addToast({ id: 'a', data: { status: 'ok' } });
		expect(store.toast('a')?.data).toEqual({ status: 'ok' });

		store.addToast({ id: 'a', title: 'Still uploading' });
		expect(store.toast('a')?.data).toEqual({ status: 'ok' });
		expect(store.toast('a')?.title).toBe('Still uploading');
		expect(ids(store)).toEqual(['a']);
	});

	it('stores a function passed as custom data on a promise toast', async () => {
		const store = seed([]);
		const loadingValue = () => 'loading';
		const successValue = () => 'done';

		const pending = store.promiseToast(Promise.resolve('done'), {
			loading: { title: 'Saving', data: loadingValue },
			success: { title: 'Saved', data: successValue },
			error: 'Failed'
		});
		expect(store.toasts[0]?.data).toBe(loadingValue);
		expect(store.toasts[0]?.type).toBe('loading');

		await expect(pending).resolves.toBe('done');
		expect(store.toasts[0]?.data).toBe(successValue);
		expect(store.toasts[0]?.title).toBe('Saved');
		expect(store.toasts[0]?.type).toBe('success');
	});

	it('does not invoke onRemove for a toast that is no longer in the store', () => {
		const onRemove = vi.fn();
		const store = seed([{ id: 'a', onRemove }]);

		store.removeToast('a');
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(ids(store)).toEqual([]);

		// Removing again must be a no-op rather than firing the callback a second time.
		store.removeToast('a');
		expect(onRemove).toHaveBeenCalledTimes(1);
	});

	describe('limit', () => {
		it('recomputes limited flags when the limit changes', () => {
			let limit = $state(3);
			// Ordered newest-first, matching how `addToast` prepends.
			const store = createStore([{ id: 'c' }, { id: 'b' }, { id: 'a' }], () => ({
				timeout: 0,
				limit
			}));

			limit = 1;
			expect(store.toast('c')?.limited).toBe(false);
			expect(store.toast('b')?.limited).toBe(true);
			expect(store.toast('a')?.limited).toBe(true);

			limit = 3;
			expect(store.toast('c')?.limited).toBe(false);
			expect(store.toast('b')?.limited).toBe(false);
			expect(store.toast('a')?.limited).toBe(false);
		});
	});

	describe('timer pausing', () => {
		afterEach(() => {
			vi.useRealTimers();
		});

		it('keeps a rescheduled timer paused while expanded, and runs it once collapsed', () => {
			vi.useFakeTimers();
			const store = seed([]);

			store.addToast({ id: 'a', title: 'a', timeout: 100 });

			// Hovering the viewport pauses the running timer.
			store.hovering = true;
			store.pauseTimers();

			// Passing `timeout` reschedules the timer. The replacement must not start
			// running while the viewport is still expanded.
			store.updateToast('a', { timeout: 100 });

			vi.advanceTimersByTime(200);
			expect(store.toast('a')?.transitionStatus).toBe('starting');

			// Collapsing must still be able to start the rescheduled timer.
			store.hovering = false;
			store.resumeTimers();

			vi.advanceTimersByTime(100);
			expect(store.toast('a')?.transitionStatus).toBe('ending');
		});

		it('does not extend the remaining time across repeated pause/resume cycles', () => {
			vi.useFakeTimers();
			const store = seed([]);

			store.addToast({ id: 'a', title: 'a', timeout: 5000 });

			// Two hover cycles, each leaving the timer running for 1000ms.
			for (let cycle = 0; cycle < 2; cycle += 1) {
				vi.advanceTimersByTime(1000);
				store.pauseTimers();
				vi.advanceTimersByTime(1000);
				store.resumeTimers();
			}

			// 2000ms of the 5000ms timeout has been consumed, so 3000ms must remain.
			vi.advanceTimersByTime(2999);
			expect(store.toast('a')?.transitionStatus).toBe('starting');

			vi.advanceTimersByTime(2);
			expect(store.toast('a')?.transitionStatus).toBe('ending');
		});

		it('restarts the full delay when the clock jumped past the timeout before pausing', () => {
			vi.useFakeTimers();
			const store = seed([]);

			store.addToast({ id: 'a', title: 'a', timeout: 5000 });

			// Mimics a throttled background tab: wall-clock time passes without the
			// scheduled timeout ever running.
			vi.setSystemTime(Date.now() + 60_000);
			store.pauseTimers();
			store.resumeTimers();

			vi.advanceTimersByTime(4999);
			expect(store.toast('a')?.transitionStatus).toBe('starting');

			vi.advanceTimersByTime(1);
			expect(store.toast('a')?.transitionStatus).toBe('ending');
		});

		it('accumulates active time across hover cycles so the toast still dismisses', () => {
			vi.useFakeTimers();
			const store = seed([]);

			store.addToast({ id: 'a', title: 'a', timeout: 100 });

			vi.advanceTimersByTime(40);
			store.pauseTimers();
			expect(store.toast('a')?.transitionStatus).toBe('starting');

			store.resumeTimers();
			vi.advanceTimersByTime(40);
			store.pauseTimers();
			expect(store.toast('a')?.transitionStatus).toBe('starting');

			store.resumeTimers();
			vi.advanceTimersByTime(40);

			expect(store.toast('a')?.transitionStatus).toBe('ending');
		});
	});
});
