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
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: AvatarRootState, children: RenderChildren]
	>;
	children?: Snippet;
}

export interface AvatarImageState extends AvatarRootState {
	/** The image's enter or exit phase. */
	transitionStatus: 'starting' | 'ending' | 'idle' | undefined;
}

export interface AvatarImageProps extends Omit<HTMLImgAttributes, 'children'> {
	/** Callback fired when the loading status changes. */
	onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
	/**
	 * Whether the image element stays mounted and loads in place instead of being preloaded.
	 * Supports `loading="lazy"` and optimized image components such as `next/image`.
	 * @default false
	 */
	keepMounted?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<[props: HTMLImgAttributes, state: AvatarImageState, children: RenderChildren]>;
	children?: Snippet;
}

export type AvatarFallbackState = AvatarRootState;

export interface AvatarFallbackProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	/**
	 * How long to wait before showing the fallback. Specified in milliseconds.
	 * @default 0
	 */
	delay?: number;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: HTMLAttributes<HTMLSpanElement>, state: AvatarFallbackState, children: RenderChildren]
	>;
	children?: Snippet;
}
