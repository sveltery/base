// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { SvelteStore } from '../../utils/store/SvelteStore.svelte.js';
import { type InteractionType } from '../../utils/useEnhancedClickHandler.js';
import type { DialogRootChangeEventDetails } from '../types.js';
import { NullStore } from '../../utils/NullStore.svelte.js';
import {
  createInitialPopupStoreState,
  type PopupStoreContext,
  popupStoreSelectors,
  type PopupTriggerDataStore,
  type PopupStoreState,
  PopupTriggerMap,
  createPopupOpenState,
} from '../../utils/popups/index.js';

export type State<Payload> = PopupStoreState<Payload> & {
  modal: boolean | 'trap-focus';
  disablePointerDismissal: boolean;
  openMethod: InteractionType | null;
  nested: boolean;
  nestedOpenDialogCount: number;
  nestedOpenDrawerCount: number;
  titleElementId: string | undefined;
  descriptionElementId: string | undefined;
  viewportElement: HTMLElement | null;
  role: 'dialog' | 'alertdialog';
};

type Context = PopupStoreContext<DialogRootChangeEventDetails> & {
  readonly popupRef: { current: HTMLElement | null };
  readonly backdropRef: { current: HTMLDivElement | null };
  readonly internalBackdropRef: { current: HTMLDivElement | null };
  readonly outsidePressEnabledRef: { current: boolean };
  readonly onNestedDialogOpen?: ((dialogCount: number, drawerCount: number) => void) | undefined;
};

const selectors = {
  ...popupStoreSelectors,
  modal: (state: State<unknown>) => state.modal,
  nested: (state: State<unknown>) => state.nested,
  nestedOpenDialogCount: (state: State<unknown>) => state.nestedOpenDialogCount,
  nestedOpenDrawerCount: (state: State<unknown>) => state.nestedOpenDrawerCount,
  disablePointerDismissal: (state: State<unknown>) => state.disablePointerDismissal,
  openMethod: (state: State<unknown>) => state.openMethod,
  descriptionElementId: (state: State<unknown>) => state.descriptionElementId,
  titleElementId: (state: State<unknown>) => state.titleElementId,
  viewportElement: (state: State<unknown>) => state.viewportElement,
  role: (state: State<unknown>) => state.role,
};

/**
 * The subset of `DialogStore` that detached handle-backed triggers rely on. Both the real
 * `DialogStore` and the inert fallback store satisfy it, so a trigger can read from whichever
 * store the handle currently exposes.
 */
export type DialogHandleStore<Payload> = PopupTriggerDataStore<State<Payload>>;

export class DialogStore<Payload> extends SvelteStore<
  Readonly<State<Payload>>,
  Context,
  typeof selectors
> {
  constructor(
    initialState: Partial<State<Payload>> | undefined,
    floatingId: string | undefined,
    nested: boolean,
  ) {
    const triggerElements = new PopupTriggerMap();
    const state = createInitialState<Payload>(initialState, triggerElements, floatingId, nested);

    super(state, createInitialContext(triggerElements), selectors);
  }

  public setOpen = (
    nextOpen: boolean,
    eventDetails: Omit<DialogRootChangeEventDetails, 'preventUnmountOnClose'>,
  ) => {
    (eventDetails as DialogRootChangeEventDetails).preventUnmountOnClose = () => {
      this.set('preventUnmountingOnClose', true);
    };

    if (!nextOpen && eventDetails.trigger == null && this.state.activeTriggerId != null) {
      // When closing the dialog, pass the old trigger to the onOpenChange event
      // so it's not reset too early (potentially causing focus issues in controlled scenarios).
      eventDetails.trigger = this.state.activeTriggerElement ?? undefined;
    }

    this.context.onOpenChange?.(nextOpen, eventDetails as DialogRootChangeEventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    this.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);

    this.update(createPopupOpenState(this.state, nextOpen, eventDetails.trigger));
  };
}

/**
 * Creates the inert fallback store used by detached handle-backed triggers while no
 * `Dialog.Root` is attached. It preserves a dialog-specific trigger registry in context so
 * detached triggers can register before migrating to the live root store.
 */
export function createNullDialogStore<Payload>(): DialogHandleStore<Payload> {
  const triggerElements = new PopupTriggerMap();

  return new NullStore<Readonly<State<Payload>>, Context, typeof selectors>(
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
    modal: true,
    disablePointerDismissal: false,
    viewportElement: null,
    descriptionElementId: undefined,
    titleElementId: undefined,
    openMethod: null,
    nested: false,
    nestedOpenDialogCount: 0,
    nestedOpenDrawerCount: 0,
    role: 'dialog',
    ...initialState,
  };

  return state;
}

function createInitialContext(triggerElements: PopupTriggerMap): Context {
  return {
    popupRef: { current: null },
    backdropRef: { current: null },
    internalBackdropRef: { current: null },
    outsidePressEnabledRef: { current: true },
    triggerElements,
    onOpenChange: undefined,
    onOpenChangeComplete: undefined,
  };
}
