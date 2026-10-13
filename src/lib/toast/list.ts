// Derived from Base UI v1.9.0 packages/react/src/toast/store.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The pure list helpers the store derives its state from.

import type { ToastObject } from './types.js';

/**
 * A toast once it lives in the store. `addToast` is the only way in and it always
 * assigns `updateKey`, so unlike the public `ToastObject` it is never missing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream's default, see types.ts
export type StoredToast<Data extends object = any> = ToastObject<Data> & { updateKey: number };

export interface ToastMetadata {
	value: StoredToast;
	domIndex: number;
	visibleIndex: number;
	offsetY: number;
}

export function createToastMetadata(toasts: StoredToast[]) {
	const metadata = new Map<string, ToastMetadata>();
	let visibleIndex = 0;
	let offsetY = 0;

	toasts.forEach((toast, domIndex) => {
		const isEnding = toast.transitionStatus === 'ending';
		metadata.set(toast.id, {
			value: toast,
			domIndex,
			visibleIndex: isEnding ? -1 : visibleIndex,
			offsetY
		});
		offsetY += toast.height || 0;
		if (!isEnding) visibleIndex += 1;
	});

	return metadata;
}

/**
 * Marks the active (non-ending) toasts beyond `limit` as limited. Toasts are in newest-first
 * order, so the newest `limit` toasts stay visible and the rest are flagged. A toast whose
 * `limited` flag is unchanged keeps its reference.
 */
export function applyLimited(toasts: StoredToast[], limit: number): StoredToast[] {
	let activeIndex = 0;
	return toasts.map((toast) => {
		if (toast.transitionStatus === 'ending') return toast;
		const limited = activeIndex >= limit;
		activeIndex += 1;
		return toast.limited === limited ? toast : { ...toast, limited };
	});
}
