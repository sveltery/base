// Base UI v1.8.0 Tabs stateAttributesMapping; MIT.
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import type { TabsRootState } from '../types.js';
import * as TabsRootDataAttributes from './TabsRootDataAttributes.js';
export const tabsStateAttributesMapping: StateAttributesMapping<TabsRootState> = {
  tabActivationDirection: (dir) => ({
    [TabsRootDataAttributes.activationDirection]: dir,
  }),
};
