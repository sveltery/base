// Derived from Base UI v1.8.0 packages/react/src/avatar/root/AvatarRootContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { ImageLoadingStatus } from './types.js';
import { defineContext } from '../internal/context.js';

export interface AvatarContextValue {
	readonly imageLoadingStatus: ImageLoadingStatus;
	setImageLoadingStatus: (status: ImageLoadingStatus) => void;
}

export const [useAvatarContext, setAvatarContext] = defineContext<AvatarContextValue>(
	'Base UI: AvatarRootContext is missing. Avatar parts must be placed within <Avatar.Root>.'
);
