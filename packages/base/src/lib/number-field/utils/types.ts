// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { REASONS } from '../../internals/reasons.js';

export type Direction = -1 | 1;

export type DirectionalChangeReason =
  | typeof REASONS.incrementPress
  | typeof REASONS.decrementPress
  | typeof REASONS.wheel
  | typeof REASONS.scrub
  | typeof REASONS.keyboard;

export interface ChangeEventCustomProperties {
  direction?: Direction | undefined;
}

export interface IncrementValueParameters {
  direction: Direction;
  event?: Event | undefined;
  reason: DirectionalChangeReason;
  currentValue?: number | null | undefined;
}

export interface EventWithOptionalKeyState {
  altKey?: boolean | undefined;
  shiftKey?: boolean | undefined;
}
