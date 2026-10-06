// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { type InlineRectCoords, updateInlineRectCoords } from '../../utils/popups/inlineRect.js';
import { SvelteStore } from '@sveltery/utils/store';
import {
  createInitialPopupStoreState,
  type PopupStoreContext,
  popupStoreSelectors,
  type PopupStoreState,
  PopupTriggerMap,
  type PopupTriggerStoreKeys,
} from '../../utils/popups/index.js';
import { applyPopupOpenChange } from '../../utils/popups/popupStoreUtils.svelte.js';
import type { PreviewCardRootChangeEventDetails } from '../types.js';
import { REASONS } from '../../internals/reasons.js';
import { NullStore } from '../../utils/NullStore.svelte.js';
import { CLOSE_DELAY } from '../utils/constants.js';
import type { Middleware as AdaptiveOriginMiddleware } from '@floating-ui/dom';

export type State<Payload> = PopupStoreState<Payload> & {
  instantType: 'dismiss' | 'focus' | undefined;
  adaptiveOrigin: AdaptiveOriginMiddleware | undefined;
  closeDelay: number;
};

export type Context = PopupStoreContext<PreviewCardRootChangeEventDetails> & {
  inlineRectCoordsRef: { current: InlineRectCoords | undefined };
};

const selectors = {
  ...popupStoreSelectors,
  instantType: (state: State<unknown>) => state.instantType,
  adaptiveOrigin: (state: State<unknown>): AdaptiveOriginMiddleware | undefined =>
    state.adaptiveOrigin,
  closeDelay: (state: State<unknown>) => state.closeDelay,
};

type Selectors = typeof selectors;

/**
 * The store view that detached handle-backed triggers read from. Both the real `PreviewCardStore`
 * and the inert fallback store satisfy it, so a trigger can read from whichever store the handle
 * currently exposes. Narrowed to the trigger-data members a trigger uses; it exposes no popup-open
 * mutator, so the inert fallback can be a plain `NullStore`.
 */
export type PreviewCardHandleStore<Payload> = Pick<
  PreviewCardStore<Payload>,
  PopupTriggerStoreKeys
>;

export class PreviewCardStore<Payload> extends SvelteStore<
  Readonly<State<Payload>>,
  Context,
  Selectors
> {
  constructor(
    initialState: Partial<State<Payload>>,
    floatingId: string | undefined,
    nested: boolean,
  ) {
    const triggerElements = new PopupTriggerMap();
    super(
      createInitialState<Payload>(initialState, triggerElements, floatingId, nested),
      createInitialContext(triggerElements),
      selectors,
    );
  }

  public setOpen = (
    nextOpen: boolean,
    eventDetails: Omit<PreviewCardRootChangeEventDetails, 'preventUnmountOnClose'>,
  ) => {
    const { inlineRectCoordsRef } = this.context;

    applyPopupOpenChange(this, nextOpen, eventDetails as PreviewCardRootChangeEventDetails, {
      onBeforeDispatch() {
        // Capture the hovered inline-rect coordinates so the card anchors to the
        // exact point on the link that was hovered.
        const event = eventDetails.event;
        if (
          nextOpen &&
          eventDetails.reason === REASONS.triggerHover &&
          eventDetails.trigger &&
          'clientX' in event &&
          'clientY' in event &&
          inlineRectCoordsRef.current?.element !== eventDetails.trigger
        ) {
          updateInlineRectCoords(
            inlineRectCoordsRef,
            eventDetails.trigger,
            event.clientX,
            event.clientY,
          );
        }
      },
    });
  };
}

/**
 * Creates the inert fallback store used by detached handle-backed triggers while no
 * `PreviewCard.Root` is attached. It preserves a preview-card-specific trigger registry in context
 * so detached triggers can register before migrating to the live root store.
 */
export function createNullPreviewCardStore<Payload>(): PreviewCardHandleStore<Payload> {
  const triggerElements = new PopupTriggerMap();

  return new NullStore<Readonly<State<Payload>>, Context, Selectors>(
    Object.freeze(createInitialState<Payload>(undefined, triggerElements)),
    Object.freeze(createInitialContext(triggerElements)),
    selectors,
  );
}

function createInitialState<Payload>(
  initialState: Partial<State<Payload>> | undefined,
  triggerElements: PopupTriggerMap,
  floatingId?: string | undefined,
  nested = false,
): State<Payload> {
  const state: State<Payload> = {
    ...createInitialPopupStoreState<Payload>(triggerElements, floatingId, nested),
    instantType: undefined,
    adaptiveOrigin: undefined,
    closeDelay: CLOSE_DELAY,
    ...initialState,
  };

  return state;
}

function createInitialContext(triggerElements: PopupTriggerMap): Context {
  return {
    popupRef: { current: null },
    onOpenChange: undefined,
    onOpenChangeComplete: undefined,
    triggerElements,
    inlineRectCoordsRef: { current: undefined },
  };
}
