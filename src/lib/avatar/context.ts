// Derived from Base UI v1.8.0 packages/react/src/avatar/root/AvatarRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import type { ImageLoadingStatus } from './types.js';

const AVATAR = Symbol('avatar');

export interface AvatarContextValue {
	readonly imageLoadingStatus: ImageLoadingStatus;
	setImageLoadingStatus: (status: ImageLoadingStatus) => void;
}

export function setAvatarContext(context: AvatarContextValue) {
	setContext(AVATAR, context);
}

export function useAvatarContext(): AvatarContextValue {
	const context = getContext<AvatarContextValue>(AVATAR);
	if (context === undefined) {
		throw new Error(
			'Base UI: AvatarRootContext is missing. Avatar parts must be placed within <Avatar.Root>.'
		);
	}
	return context;
}
