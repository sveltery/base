// Derived from Base UI v1.9.0 packages/react/src/avatar/root/AvatarRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { ImageLoadingStatus } from './types.js';
import { defineContext } from '../internal/context.js';

export interface AvatarContextValue {
	readonly imageLoadingStatus: ImageLoadingStatus;
	setImageLoadingStatus: (status: ImageLoadingStatus) => void;
}

export const [useAvatarContext, setAvatarContext] = defineContext<AvatarContextValue>(
	'Base UI: AvatarRootContext is missing. Avatar parts must be placed within <Avatar.Root>.'
);
