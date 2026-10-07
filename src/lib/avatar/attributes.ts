// Derived from Base UI v1.8.0 packages/react/src/avatar/root/stateAttributesMapping.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { ImageLoadingStatus } from './types.js';

/** Loading status is not copied onto a `data-*` attribute. Image uses its own hooks. */
export const avatarStateAttributesMapping: StateAttributesMapping<{
	imageLoadingStatus: ImageLoadingStatus;
}> = {
	imageLoadingStatus: () => null
};
