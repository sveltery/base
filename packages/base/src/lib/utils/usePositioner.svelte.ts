// Original Base UI 1.8.0 usePositioner prop business, component-owned native hosts (MIT).
import { popupStateMapping } from './popupStateMapping.js';
import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
import type { HTMLProps } from '../internals/types.js';
interface UsePositionerOptions {
  styles: Record<string, string | undefined>;
  transitionStatus: TransitionStatus;
  props?: HTMLProps | undefined;
  hidden?: boolean | undefined;
  inert?: boolean | undefined;
}
export function usePositioner<State extends object>(
  getState: () => State,
  getOptions: () => UsePositionerOptions,
) {
  const props = $derived.by(() => {
    const { styles, transitionStatus, props, hidden, inert = false } = getOptions();
    const style = { ...styles };
    if (inert) style.pointerEvents = 'none';
    return [
      { role: 'presentation', hidden, style },
      getDisabledMountTransitionStyles(transitionStatus),
      props,
    ];
  });
  return {
    get state() {
      return getState();
    },
    get props() {
      return props;
    },
    stateAttributesMapping: popupStateMapping as StateAttributesMapping<State>,
  };
}
