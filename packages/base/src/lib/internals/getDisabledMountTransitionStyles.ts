// Original Base UI 1.8.0 getDisabledMountTransitionStyles (MIT).
import { EMPTY_OBJECT } from '@sveltery/utils/empty';
import { DISABLED_TRANSITIONS_STYLE } from './constants.js';
import type { TransitionStatus } from './useTransitionStatus.svelte.js';
export function getDisabledMountTransitionStyles(transitionStatus: TransitionStatus): {
  style?: { transition: string } | undefined;
} {
  return transitionStatus === 'starting' ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT;
}
