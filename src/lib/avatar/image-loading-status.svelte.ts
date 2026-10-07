// Derived from Base UI v1.8.0 packages/react/src/avatar/image/useImageLoadingStatus.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { ImageLoadingStatus } from './types.js';

export interface ImageProbeSource {
	src?: string | null;
	srcset?: string | null;
	sizes?: string | null;
	crossorigin?: string | null;
	referrerpolicy?: string | null;
}

/**
 * Detached image probe. Call once during component init.
 * `enabled` is false while `keepMounted` reads the rendered element instead.
 */
export function createImageLoadingStatus(enabled: () => boolean, source: () => ImageProbeSource) {
	let status = $state<ImageLoadingStatus>('idle');

	$effect(() => {
		if (!enabled()) return;

		const { src, srcset, sizes, crossorigin, referrerpolicy } = source();
		if (!src && !srcset) {
			status = 'error';
			return;
		}

		let active = true;
		const image = new Image();
		const update = (next: ImageLoadingStatus) => () => {
			if (!active) return;
			status = next;
		};

		// Handlers, then request hints, then src. A cached image can finish inside the src write.
		status = 'loading';
		image.onload = update('loaded');
		image.onerror = update('error');
		if (referrerpolicy) image.referrerPolicy = referrerpolicy;
		image.crossOrigin = crossorigin ?? null;
		if (sizes) image.sizes = sizes;
		if (srcset) image.srcset = srcset;
		if (src) image.src = src;
		if (image.complete) {
			status = image.naturalWidth > 0 ? 'loaded' : 'error';
		}

		return () => {
			active = false;
		};
	});

	return {
		get status(): ImageLoadingStatus {
			return status;
		},
		setStatus(next: ImageLoadingStatus) {
			status = next;
		}
	};
}
