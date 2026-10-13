// Derived from Base UI v1.9.0 packages/react/src/avatar/root/stateAttributesMapping.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../internal/state-attributes.js';
import type { ImageLoadingStatus } from './types.js';

/** Loading status is not copied onto a `data-*` attribute. Image uses its own hooks. */
export const avatarStateAttributesMapping: StateAttributesMapping<{
	imageLoadingStatus: ImageLoadingStatus;
}> = {
	imageLoadingStatus: () => null
};
