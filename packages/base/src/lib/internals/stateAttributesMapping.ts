// Ported from Base UI v1.8.0 stateAttributesMapping.ts; MIT: THIRD_PARTY_NOTICES.md.
import type { TransitionStatus } from './useTransitionStatus.svelte.js';
import type { StateAttributesMapping } from './getStateAttributesProps.js';
import * as TransitionStatusDataAttributes from './TransitionStatusDataAttributes.js';
export { TransitionStatusDataAttributes };
const STARTING_HOOK = { [TransitionStatusDataAttributes.startingStyle]: '' };
const ENDING_HOOK = { [TransitionStatusDataAttributes.endingStyle]: '' };
export const transitionStatusMapping = {
  transitionStatus(value): Record<string, string> | null {
    if (value === 'starting') return STARTING_HOOK;
    if (value === 'ending') return ENDING_HOOK;
    return null;
  },
} satisfies StateAttributesMapping<{ transitionStatus: TransitionStatus }>;
