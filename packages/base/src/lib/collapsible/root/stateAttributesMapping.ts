// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import { collapsibleOpenStateMapping as baseMapping } from '../../utils/collapsibleOpenStateMapping.js';
import type { CollapsibleRootState } from '../types.js';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';

export const collapsibleStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
  ...baseMapping,
  ...transitionStatusMapping,
};
