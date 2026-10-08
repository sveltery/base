// Public contracts derived from Base UI v1.8.0 avatar root, image and fallback
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AvatarRootState {
	/** The image loading status shared with Image and Fallback. */
	imageLoadingStatus: ImageLoadingStatus;
}

export interface AvatarRootProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: AvatarRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export type AvatarImageState = AvatarRootState;

export interface AvatarImageProps extends Omit<HTMLImgAttributes, 'children'> {
	/**
	 * Called when the loading status changes. `idle` is not emitted.
	 * Removing the image sets the root back to `idle` without this callback.
	 */
	onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
	/**
	 * Keep the `<img>` mounted and read its status from the element.
	 * When false, a detached image probes the source and the `<img>` renders only after it loads.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Replace the default `<img>`. Spread `props` onto the host element. */
	render?: Snippet<[props: HTMLImgAttributes, state: AvatarImageState, children: RenderChildren]>;
	children?: Snippet;
}

export type AvatarFallbackState = AvatarRootState;

export interface AvatarFallbackProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * How long to wait before showing the fallback, in milliseconds.
	 * Once the fallback has been shown, a later delay does not hide it again.
	 * @default 0
	 */
	delay?: number;
	/** Replace the default `<span>`. Spread `props` onto the host element. */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: AvatarFallbackState, children: RenderChildren]
	>;
	children?: Snippet;
}
