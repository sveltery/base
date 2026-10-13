// Derived from Base UI v1.9.0 packages/react/src/toast/store.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream's `ReactStore` state is `$state` fields. Selectors are getters and methods.
// `timeout` and `limit` read the provider's props, so there is no `syncProviderProps`:
// `toasts` derives each toast's `limited` flag from the current limit, the way upstream
// re-applies it on every add, close, and limit change. The list is replaced, never mutated,
// so a root's `toast` prop changes identity on every update.
// `promiseToast` returns the handled promise. The provider hands it back to the manager,
// which replaces upstream's `setPromise` option probe.

import { activeElement, contains, getTarget, ownerDocument } from '@sveltery/utils';
import { applyLimited, createToastMetadata, type StoredToast } from './list.js';
import { ToastTimers } from './timers.js';
import type {
	ToastManagerAddOptions,
	ToastManagerPromiseOptions,
	ToastManagerUpdate,
	ToastObject
} from './types.js';
import { generateId, isFocusVisible, resolvePromiseOptions } from './utils.js';

type ToastInternalUpdateOptions<Data extends object> = Partial<
	Omit<ToastObject<Data>, 'id' | 'updateKey'>
>;

export interface ToastStoreProps {
	timeout: number;
	limit: number;
}

export class ToastStore {
	#list = $state.raw<StoredToast[]>([]);
	readonly toasts = $derived(applyLimited(this.#list, this.limit));
	readonly toastMetadata = $derived(createToastMetadata(this.toasts));
	hovering = $state(false);
	focused = $state(false);
	isWindowFocused = $state(true);
	viewport = $state<HTMLElement | null>(null);
	prevFocusElement = $state<HTMLElement | null>(null);

	readonly #timers = new ToastTimers();

	constructor(private readonly props: () => ToastStoreProps) {}

	get timeout() {
		return this.props().timeout;
	}

	get limit() {
		return this.props().limit;
	}

	get isEmpty() {
		return this.toasts.length === 0;
	}

	get expanded() {
		return this.hovering || this.focused;
	}

	get expandedOrOutOfFocus() {
		return this.hovering || this.focused || !this.isWindowFocused;
	}

	toast(id: string) {
		return this.toastMetadata.get(id)?.value;
	}

	toastIndex(id: string) {
		return this.toastMetadata.get(id)?.domIndex ?? -1;
	}

	toastOffsetY(id: string) {
		return this.toastMetadata.get(id)?.offsetY ?? 0;
	}

	toastVisibleIndex(id: string) {
		return this.toastMetadata.get(id)?.visibleIndex ?? -1;
	}

	/** Clears every timer. The provider calls it when it is destroyed. */
	dispose() {
		this.#timers.dispose();
	}

	removeToast(toastId: string, skipOnRemove = false) {
		const index = this.toastIndex(toastId);
		if (index === -1) return;

		const toast = this.toasts[index];
		if (!skipOnRemove) toast?.onRemove?.();

		const newToasts = [...this.toasts];
		newToasts.splice(index, 1);
		this.#setToasts(newToasts);
	}

	addToast = <Data extends object>(toast: ToastManagerAddOptions<Data>): string => {
		const id = toast.id || generateId('toast');

		if (toast.id) {
			const existingToast = this.toast(toast.id);
			if (existingToast) {
				if (existingToast.transitionStatus === 'ending') {
					this.removeToast(toast.id, true);
				} else {
					const { id: _id, transitionStatus: _status, ...updates } = toast;
					this.updateToastInternal(toast.id, updates, true, true);
					return toast.id;
				}
			}
		}

		const toastToAdd: StoredToast<Data> = {
			...toast,
			id,
			updateKey: 0,
			transitionStatus: 'starting'
		};

		this.#setToasts([toastToAdd, ...this.toasts]);

		const duration = toastToAdd.timeout ?? this.timeout;
		if (toastToAdd.type !== 'loading' && duration > 0) {
			this.#timers.schedule(id, duration, !this.expandedOrOutOfFocus, () => this.closeToast(id));
		}

		if (this.expandedOrOutOfFocus) this.pauseTimers();

		return id;
	};

	updateToast = <Data extends object>(id: string, updates: ToastManagerUpdate<Data>) => {
		const prevToast = this.toast(id);
		// Never run the updater for an update the store is going to ignore.
		if (!prevToast || prevToast.transitionStatus === 'ending') return;

		// The updater may have called back into the store, so the internal update
		// reads the current state again.
		this.updateToastInternal(
			id,
			typeof updates === 'function' ? updates(prevToast) : updates,
			false,
			true
		);
	};

	updateToastInternal = <Data extends object>(
		id: string,
		updates: ToastInternalUpdateOptions<Data>,
		resetTimer = false,
		markUpdated = false
	) => {
		const prevToast = this.toast(id);
		if (!prevToast) return;

		// Ignore updates for toasts that are already closing. This prevents races where
		// async updates (e.g. promise success/error) can block a dismissal from completing.
		if (prevToast.transitionStatus === 'ending') return;

		const nextToast: StoredToast = {
			...prevToast,
			...updates,
			...(markUpdated && { updateKey: prevToast.updateKey + 1 })
		};

		this.#setToasts(this.toasts.map((toast) => (toast.id === id ? nextToast : toast)));

		const nextTimeout = nextToast.timeout ?? this.timeout;
		const prevTimeout = prevToast.timeout ?? this.timeout;
		const timeoutUpdated = Object.hasOwn(updates, 'timeout');
		const shouldHaveTimer =
			nextToast.transitionStatus !== 'ending' && nextToast.type !== 'loading' && nextTimeout > 0;
		const hasTimer = this.#timers.has(id);
		const timeoutChanged = prevTimeout !== nextTimeout;
		const wasLoading = prevToast.type === 'loading';

		if (!shouldHaveTimer && hasTimer) {
			this.#timers.clear(id);
			return;
		}

		if (
			shouldHaveTimer &&
			(!hasTimer || timeoutChanged || timeoutUpdated || wasLoading || resetTimer)
		) {
			this.#timers.clear(id);
			this.#timers.schedule(id, nextTimeout, !this.expandedOrOutOfFocus, () => this.closeToast(id));
			if (this.expandedOrOutOfFocus) this.pauseTimers();
		}
	};

	closeToast = (toastId?: string) => {
		const closeAll = toastId === undefined;
		const toasts = this.toasts;
		let toastsToClose: StoredToast[];

		if (closeAll) {
			toastsToClose = toasts;
			this.#timers.clearAll();
		} else {
			const toast = this.toast(toastId);
			if (!toast) return;
			toastsToClose = [toast];
			this.#timers.clear(toastId);
		}

		const endingToasts = toasts.map((item) =>
			closeAll || item.id === toastId
				? { ...item, transitionStatus: 'ending' as const, height: 0 }
				: item
		);
		this.#setToasts(
			endingToasts,
			!endingToasts.some((toast) => toast.transitionStatus !== 'ending')
		);

		toastsToClose.forEach((toast) => {
			if (toast.transitionStatus !== 'ending') toast.onClose?.();
		});

		this.#handleFocusManagement(toastId);
	};

	promiseToast = <Value, Data extends object>(
		promiseValue: Promise<Value>,
		options: ToastManagerPromiseOptions<Value, Data>
	): Promise<Value> => {
		// A loading toast does not auto-dismiss.
		const id = this.addToast({ ...resolvePromiseOptions(options.loading), type: 'loading' });

		return promiseValue
			.then((result: Value) => {
				const successOptions = resolvePromiseOptions(options.success, result);
				this.updateToast(id, {
					...successOptions,
					type: 'success',
					timeout: successOptions.timeout
				});
				return result;
			})
			.catch((error) => {
				const errorOptions = resolvePromiseOptions(options.error, error);
				this.updateToast(id, { ...errorOptions, type: 'error', timeout: errorOptions.timeout });
				return Promise.reject(error);
			});
	};

	pauseTimers() {
		this.#timers.pause();
	}

	resumeTimers() {
		this.#timers.resume();
	}

	restoreFocusToPrevElement() {
		this.prevFocusElement?.focus({ preventScroll: true });
	}

	handleDocumentPointerDown = (event: PointerEvent) => {
		if (event.pointerType !== 'touch') return;
		if (contains(this.viewport, getTarget(event))) return;

		// This is explicit touch activity outside the viewport, so the paused
		// interaction state should end even if the window focus state is unchanged.
		this.resumeTimers();
		this.hovering = false;
		this.focused = false;
	};

	#setToasts(newToasts: StoredToast[], clearInteraction = newToasts.length === 0) {
		this.#list = newToasts;
		if (clearInteraction) {
			this.hovering = false;
			this.focused = false;
		}
	}

	#handleFocusManagement(toastId: string | undefined) {
		const viewport = this.viewport;
		const activeEl = activeElement(ownerDocument(viewport));
		if (!viewport || !contains(viewport, activeEl) || !isFocusVisible(activeEl)) return;

		if (toastId === undefined) {
			this.restoreFocusToPrevElement();
			return;
		}

		const toasts = this.toasts;
		const currentIndex = this.toastIndex(toastId);

		const scan = (from: number, step: number) => {
			for (let index = from; index >= 0 && index < toasts.length; index += step) {
				if (toasts[index].transitionStatus !== 'ending') return toasts[index];
			}
			return null;
		};

		// Try to find the next toast that isn't animating out, then fall back to the previous one.
		const nextToast = scan(currentIndex + 1, 1) ?? scan(currentIndex - 1, -1);

		if (nextToast) nextToast.element?.focus();
		else this.restoreFocusToPrevElement();
	}
}
