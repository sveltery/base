// Assertions follow Base UI v1.9.0 packages/react/src/toast/provider/ToastProvider.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The suspended-render provider case is React-only.
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ToastProviderEffectsHarness from '../../tests/ToastProviderEffectsHarness.svelte';
import { advance, disableAnimations, useFakeClock } from '../../tests/toast.js';
import { Toast } from './index.js';

disableAnimations();

describe('<Toast.Provider />', () => {
	useFakeClock();

	it('syncs a changed timeout before descendant effects', async () => {
		const onClose = vi.fn();
		const view = render(ToastProviderEffectsHarness, {
			timeout: 5000,
			add: (manager) => manager.add({ id: 'toast', title: 'Toast', onClose })
		});

		await view.rerender({ timeout: 1000, active: true });

		await advance(999);
		expect(onClose).not.toHaveBeenCalled();

		await advance(2);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('adds a toast once from an effect through a toast manager', async () => {
		const toastManager = Toast.createToastManager();
		let toastCount = -1;
		const view = render(ToastProviderEffectsHarness, {
			toastManager,
			add: () => toastManager.add({ id: 'toast', title: 'Toast' }),
			observe: (manager) => (toastCount = manager.toasts.length)
		});

		await view.rerender({ active: true });

		expect(toastCount).toBe(1);
	});

	it('syncs a changed limit before descendant effects', async () => {
		const observeToasts = vi.fn();
		const view = render(ToastProviderEffectsHarness, {
			limit: 3,
			add(manager) {
				manager.add({ id: 'first', title: 'First', timeout: 0 });
				manager.add({ id: 'second', title: 'Second', timeout: 0 });
			},
			observe(manager) {
				observeToasts(manager.toasts.map((toast) => ({ id: toast.id, limited: toast.limited })));
			}
		});

		await view.rerender({ limit: 1, active: true });

		expect(observeToasts).toHaveBeenNthCalledWith(1, [
			{ id: 'second', limited: false },
			{ id: 'first', limited: true }
		]);
	});
});
