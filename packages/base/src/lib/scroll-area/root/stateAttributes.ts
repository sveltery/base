// Ported from Base UI v1.8.0 immutable47b40521; MIT: THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps.js';
import type { ScrollAreaRootState } from '../types.js';
import * as ScrollAreaRootDataAttributes from './ScrollAreaRootDataAttributes.js';

const attr = (name: string) => (value: boolean) => (value ? { [name]: '' } : null);

export const scrollAreaStateAttributesMapping: StateAttributesMapping<ScrollAreaRootState> = {
  hasOverflowX: attr(ScrollAreaRootDataAttributes.hasOverflowX),
  hasOverflowY: attr(ScrollAreaRootDataAttributes.hasOverflowY),
  overflowXStart: attr(ScrollAreaRootDataAttributes.overflowXStart),
  overflowXEnd: attr(ScrollAreaRootDataAttributes.overflowXEnd),
  overflowYStart: attr(ScrollAreaRootDataAttributes.overflowYStart),
  overflowYEnd: attr(ScrollAreaRootDataAttributes.overflowYEnd),
  cornerHidden: () => null,
};
