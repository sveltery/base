// Original Base UI 1.8.0 usePositioner business, RenderElement native component boundary (MIT).
import { popupStateMapping } from './popupStateMapping.js';
import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
import type { UseRenderElementParameters } from '../internals/useRenderElement.js';
import type { MergedRef } from '@sveltery/utils/useMergedRefs';
import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
import type { HTMLProps } from '../internals/types.js';
interface UsePositionerOptions {
  styles: Record<string, string | undefined>;
  transitionStatus: TransitionStatus;
  props?: HTMLProps | undefined;
  refs?: MergedRef<HTMLElement>[] | undefined;
  hidden?: boolean | undefined;
  inert?: boolean | undefined;
}
export function usePositioner<State extends object>(
  getState: () => State,
  getOptions: () => UsePositionerOptions,
) {
  const params = $derived.by((): UseRenderElementParameters<State, HTMLElement> => {
    const { styles, transitionStatus, props, refs, hidden, inert = false } = getOptions();
    const style = { ...styles };
    if (inert) style.pointerEvents = 'none';
    return {
      state: getState(),
      ref: refs,
      props: [
        { role: 'presentation', hidden, style },
        getDisabledMountTransitionStyles(transitionStatus),
        props,
      ],
      stateAttributesMapping: popupStateMapping as StateAttributesMapping<State>,
    };
  });
  return {
    get params() {
      return params;
    },
  };
}
