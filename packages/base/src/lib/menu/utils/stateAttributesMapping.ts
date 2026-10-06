// Original Menu item mapping (MIT).
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping.js';
import * as MenuCheckboxItemDataAttributes from '../checkbox-item/MenuCheckboxItemDataAttributes.js';

export const itemMapping: StateAttributesMapping<{ checked: boolean }> = {
  checked(value): Record<string, string> {
    if (value) {
      return {
        [MenuCheckboxItemDataAttributes.checked]: '',
      };
    }
    return {
      [MenuCheckboxItemDataAttributes.unchecked]: '',
    };
  },
  ...transitionStatusMapping,
};
