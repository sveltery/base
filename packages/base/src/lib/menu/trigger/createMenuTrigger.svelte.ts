import { createAttachmentKey } from 'svelte/attachments';
import { onDestroy, untrack } from 'svelte';
// Original MenuTrigger complete business, native live props/event/ref boundary (MIT).
import { Timeout } from '@sveltery/utils/useTimeout';
import { ownerDocument } from '@sveltery/utils/owner';

import { EMPTY_OBJECT } from '@sveltery/utils/empty';
import { safePolygon } from '../../floating-ui/safePolygon.js';
import { useClick } from '../../floating-ui/hooks/useClick.svelte.js';
import {
  useFloatingTree,
  useFloatingNodeId,
  useFloatingParentNodeId,
} from '../../floating-ui/components/FloatingTree.svelte.js';
import { useFocus } from '../../floating-ui/hooks/useFocus.svelte.js';
import { useHoverReferenceInteraction } from '../../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
import { FloatingTreeStore } from '../../floating-ui/components/FloatingTreeStore.js';
import { contains } from '../../floating-ui/utils/element.js';
import { useMenuRootContext } from '../root/MenuRootContext.js';
import { useButton } from '../../internals/use-button/useButton.svelte.js';
import { isMouseWithinBounds } from '../../utils/getPseudoElementBounds.js';
import { useCompositeRootContext } from '../../internals/composite/root/CompositeRootContext.js';
import { findRootOwnerId } from '../utils/findRootOwnerId.js';
import { usePopupHandleStore } from '../../utils/popups/usePopupHandleStore.svelte.js';
import { useTriggerDataForwarding } from '../../utils/popups/popupStoreUtils.svelte.js';
import { useTriggerFocusGuards } from '../../utils/popups/useTriggerFocusGuards.svelte.js';
import { useBaseUiId } from '../../internals/useBaseUiId.js';
import { REASONS } from '../../internals/reasons.js';
import { useMixedToggleClickHandler } from '../../utils/useMixedToggleClickHandler.svelte.js';
import { useMenubarContext } from '../../menubar/MenubarContext.js';
import { PATIENT_CLICK_THRESHOLD } from '../../internals/constants.js';
import { mergeProps } from '../../merge-props/index.js';
import type { MenuTriggerProps, MenuTriggerState, MenuParent } from '../types.js';
import type { MenuHandleStore } from '../store/MenuStore.svelte.js';
import type { PropSource } from '../../internals/mergeComponentProps.js';
export class MenuTrigger<Payload> {
  private readonly triggerElementRef: { current: HTMLElement | null };
  private readonly triggerRef: { current: HTMLElement | null };
  private readonly allowMouseUpTriggerTimeout: Timeout;
  private readonly stickIfOpen: StickIfOpen;
  private readonly readState: () => MenuTriggerState;
  private readonly readProps: () => readonly Exclude<PropSource, undefined>[];
  private readonly readIsInMenubar: () => boolean;
  private readonly readIsOpenedByThisTrigger: () => boolean;
  readonly store: () => MenuHandleStore<unknown>;
  readonly preFocusGuardRef: ReturnType<typeof useTriggerFocusGuards>['preFocusGuardRef'];
  readonly handlePreFocusGuardFocus: ReturnType<
    typeof useTriggerFocusGuards
  >['handlePreFocusGuardFocus'];
  readonly handleFocusTargetFocus: ReturnType<
    typeof useTriggerFocusGuards
  >['handleFocusTargetFocus'];

  get state() {
    return this.readState();
  }
  get props() {
    return this.readProps();
  }
  get isInMenubar() {
    return this.readIsInMenubar();
  }
  get isOpenedByThisTrigger() {
    return this.readIsOpenedByThisTrigger();
  }

  constructor(
    getProps: () => MenuTriggerProps<Payload>,
    generatedId: string,
    setRef: (node: HTMLElement | null) => void,
  ) {
    const {
      render,
      class: className,
      style,
      disabled: disabledProp = false,
      nativeButton = true,
      id: idProp,
      openOnHover: openOnHoverProp,
      delay = 100,
      closeDelay = 0,
      handle,
      payload,
      children,
      ref: consumerRef,
      ...elementProps
    } = $derived(getProps());
    // Host render/ref fields are consumed by the native component, excluded from forwarded props.
    untrack(() => {
      void [render, className, style, children, consumerRef];
    });
    const rootContext = useMenuRootContext(true);
    const handleStore = usePopupHandleStore(() => handle);
    const store: MenuHandleStore<unknown> = $derived.by(() => {
      const value = handleStore.store ?? rootContext?.store;
      if (!value)
        throw new Error(
          'Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.',
        );
      return value as MenuHandleStore<unknown>;
    });
    const thisTriggerId = $derived(useBaseUiId(idProp ?? undefined, generatedId));
    const isTriggerActive = $derived(store.useState('isTriggerActive', thisTriggerId));
    const floatingRootContext = $derived(store.useState('floatingRootContext'));
    const isOpenedByThisTrigger = $derived(store.useState('isOpenedByTrigger', thisTriggerId));
    const popupId = $derived(store.useState('triggerPopupId', thisTriggerId));
    this.triggerElementRef = { current: null };
    const triggerElementRef = this.triggerElementRef;
    const parent = useMenuParent();
    const compositeRootContext = useCompositeRootContext(true);
    const floatingTreeRootFromContext = useFloatingTree();
    const floatingTreeRoot: FloatingTreeStore = $derived.by(() => {
      return floatingTreeRootFromContext ?? new FloatingTreeStore();
    });
    const floatingNodeId = useFloatingNodeId(
      `${generatedId}-node`,
      untrack(() => floatingTreeRoot),
    );
    const floatingParentNodeId = useFloatingParentNodeId();
    const forwarding = useTriggerDataForwarding(
      () => thisTriggerId,
      triggerElementRef,
      () => store,
      () => ({
        payload,
        closeDelay,
        parent,
        floatingTreeRoot,
        floatingNodeId,
        floatingParentNodeId,
        keyboardEventRelay: compositeRootContext?.relayKeyboardEvent,
      }),
    );
    const isInMenubar = $derived(parent.type === 'menubar');
    const rootDisabled = $derived(store.useState('disabled'));
    const disabled = $derived(
      disabledProp || rootDisabled || (parent.type === 'menubar' && parent.context.disabled),
    );
    const { getButtonProps, buttonRef } = useButton(() => ({
      disabled,
      native: nativeButton,
    }));
    $effect(() => {
      if (!isOpenedByThisTrigger && parent.type === undefined) {
        store.context.allowMouseUpTriggerRef.current = false;
      }
    });
    this.triggerRef = { current: null };
    const triggerRef = this.triggerRef;
    this.allowMouseUpTriggerTimeout = new Timeout();
    const allowMouseUpTriggerTimeout = this.allowMouseUpTriggerTimeout;
    onDestroy(allowMouseUpTriggerTimeout.clear);
    const handleDocumentMouseUp = (mouseEvent: MouseEvent) => {
      if (!triggerRef.current) {
        return;
      }
      allowMouseUpTriggerTimeout.clear();
      store.context.allowMouseUpTriggerRef.current = false;
      const mouseUpTarget = mouseEvent.target as Element | null;
      if (
        contains(triggerRef.current, mouseUpTarget) ||
        contains(store.select('positionerElement'), mouseUpTarget) ||
        mouseUpTarget === triggerRef.current
      ) {
        return;
      }
      if (mouseUpTarget != null && findRootOwnerId(mouseUpTarget) === store.select('rootId')) {
        return;
      }
      if (isMouseWithinBounds(mouseEvent, triggerRef.current)) {
        return;
      }
      floatingTreeRoot.events.emit('close', {
        domEvent: mouseEvent,
        reason: REASONS.cancelOpen,
      });
    };
    $effect(() => {
      if (isOpenedByThisTrigger && store.select('lastOpenChangeReason') === REASONS.triggerHover) {
        const doc = ownerDocument(triggerRef.current);
        doc.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
      }
    });
    const parentMenubarHasSubmenuOpen = $derived(
      parent.type === 'menubar' && parent.context.hasSubmenuOpen,
    );
    const openOnHover = $derived(openOnHoverProp ?? parentMenubarHasSubmenuOpen);
    const hoverProps = useHoverReferenceInteraction(
      () => floatingRootContext,
      () => ({
        enabled:
          openOnHover &&
          !disabled &&
          (!isInMenubar || (parentMenubarHasSubmenuOpen && !forwarding.isMountedByThisTrigger)),
        handleClose: safePolygon({ blockPointerEvents: !isInMenubar }),
        mouseOnly: true,
        move: false,
        restMs: parent.type === undefined ? delay : undefined,
        delay: { close: closeDelay },
        triggerElementRef,
        externalTree: floatingTreeRoot,
        isActiveTrigger: isTriggerActive,
        isClosing: () => store.select('transitionStatus') === 'ending',
      }),
    );
    // Whether to ignore clicks to open the menu.
    // `lastOpenChangeReason` doesn't need to be reactive here, as we need to run this
    // only when `isOpenedByThisTrigger` changes.
    this.stickIfOpen = new StickIfOpen(
      () => isOpenedByThisTrigger,
      () => store.select('lastOpenChangeReason'),
    );
    const click = useClick(
      () => floatingRootContext,
      () => ({
        enabled: !disabled,
        event: isOpenedByThisTrigger && isInMenubar ? 'click' : 'mousedown',
        toggle: true,
        ignoreMouse: false,
        stickIfOpen: parent.type === undefined ? this.stickIfOpen.value : false,
      }),
    );
    const focus = useFocus(
      () => floatingRootContext,
      () => ({
        enabled: !disabled && parentMenubarHasSubmenuOpen,
      }),
    );
    const mixedToggleHandlers = useMixedToggleClickHandler(() => ({
      open: isOpenedByThisTrigger,
      enabled: isInMenubar,
      mouseDownAction: 'open',
    }));
    const localInteractionProps = $derived.by(() => mergeProps(focus.reference, click.reference));
    const rootTriggerProps = $derived(
      store.useState('triggerProps', forwarding.isMountedByThisTrigger),
    );
    const { preFocusGuardRef, handlePreFocusGuardFocus, handleFocusTargetFocus } =
      useTriggerFocusGuards(() => store, triggerElementRef);
    const state: MenuTriggerState = $derived({
      disabled,
      open: isOpenedByThisTrigger,
    });
    const hostAttachmentKey = createAttachmentKey();
    function attachHost(host: HTMLElement) {
      triggerRef.current = host;
      setRef(host);
      untrack(() => buttonRef(host));
      forwarding.registerTrigger(host);
      triggerElementRef.current = host;
      return () => {
        if (triggerRef.current !== host) return;
        if (triggerRef.current === host) triggerRef.current = null;
        setRef(null);
        buttonRef(null);
        forwarding.registerTrigger(null);
        if (triggerElementRef.current === host) triggerElementRef.current = null;
      };
    }
    const props = $derived([
      { [hostAttachmentKey]: attachHost },
      localInteractionProps,
      hoverProps() ?? EMPTY_OBJECT,
      rootTriggerProps,
      {
        'aria-haspopup': 'menu' as const,
        'aria-controls': popupId,
        id: thisTriggerId,
        onmousedown: (event: MouseEvent) => {
          if (store.select('open')) {
            return;
          }
          // mousedown -> mouseup on menu item should not trigger it within 200ms.
          allowMouseUpTriggerTimeout.start(200, () => {
            store.context.allowMouseUpTriggerRef.current = true;
          });
          const doc = ownerDocument(event.currentTarget as Element);
          doc.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
        },
      },
      isInMenubar ? { role: 'menuitem' } : {},
      mixedToggleHandlers(),
      elementProps,
      getButtonProps,
    ]);
    this.readState = () => state;
    this.readProps = () => props;
    this.readIsInMenubar = () => isInMenubar;
    this.readIsOpenedByThisTrigger = () => isOpenedByThisTrigger;
    this.store = () => store;
    this.preFocusGuardRef = preFocusGuardRef;
    this.handlePreFocusGuardFocus = handlePreFocusGuardFocus;
    this.handleFocusTargetFocus = handleFocusTargetFocus;
  }
}

/** Original useStickIfOpen patient-click state and timeout, owned by the trigger lifetime. */
class StickIfOpen {
  private readonly stickIfOpenTimeout = new Timeout();
  value = $state(false);

  constructor(getOpen: () => boolean, getOpenReason: () => string | null) {
    onDestroy(this.stickIfOpenTimeout.clear);
    const open = $derived(getOpen());
    const openReason = $derived(getOpenReason());
    $effect(() => {
      if (open && openReason === REASONS.triggerHover) {
        // Only allow "patient" clicks to close the menu if it's open.
        // If they clicked within 500ms of the menu opening, keep it open.
        this.value = true;
        this.stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
          this.value = false;
        });
      } else if (!open) {
        this.stickIfOpenTimeout.clear();
        this.value = false;
      }
    });
  }
}

function useMenuParent() {
  const menubarContext = useMenubarContext(true);
  const parent: MenuParent = (() => {
    if (menubarContext) {
      return {
        type: 'menubar',
        context: menubarContext,
      };
    }
    return {
      type: undefined,
    };
  })();
  return parent;
}
