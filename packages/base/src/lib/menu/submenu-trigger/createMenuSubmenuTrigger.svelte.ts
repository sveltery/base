// Original MenuSubmenuTrigger full item/navigation/hover business, native live props (MIT).
import { untrack } from 'svelte';
import { DEV } from 'esm-env';
import { isElementDisabled } from '@sveltery/utils/isElementDisabled';
import { warn } from '@sveltery/utils/warn';
import { EMPTY_OBJECT } from '@sveltery/utils/empty';
import { platform } from '@sveltery/utils/platform';
import { useStableCallback } from '@sveltery/utils/useStableCallback';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { safePolygon } from '../../floating-ui/safePolygon.js';
import { useClick } from '../../floating-ui/hooks/useClick.svelte.js';
import { useHoverReferenceInteraction } from '../../floating-ui/hooks/useHoverReferenceInteraction.svelte.js';
import { useMenuRootContext } from '../root/MenuRootContext.js';
import { useBaseUiId } from '../../internals/useBaseUiId.js';
import { useCompositeListItem } from '../../internals/composite/list/useCompositeListItem.svelte.js';
import { useMenuItem } from '../item/useMenuItem.svelte.js';
import { useMenuPositionerContext } from '../positioner/MenuPositionerContext.js';
import { useTriggerRegistration } from '../../utils/popups/popupStoreUtils.svelte.js';
import { useMenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext.js';
import { REASONS } from '../../internals/reasons.js';
import type { MenuSubmenuTriggerProps, MenuSubmenuTriggerState } from '../types.js';
const VOICE_OVER_EXPANDED_PROPS = { 'aria-expanded': undefined };
export function createMenuSubmenuTrigger(getProps: () => MenuSubmenuTriggerProps, generatedId: string, setRef: (node: HTMLElement | null) => void) {
    const { render, class: className, style, label, id: idProp, nativeButton = false, openOnHover = true, delay = 100, closeDelay = 0, disabled: disabledProp = false, children, ref, ...elementProps } = $derived(getProps());
    // Host render/ref fields are consumed by the native component, excluded from forwarded props.
    untrack(() => { void [render, className, style, children, ref]; });
    const submenuRootContext = useMenuSubmenuRootContext();
    if (!submenuRootContext?.parentMenu) {
        throw new Error('Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.');
    }
    const listItem = useCompositeListItem(() => ({ guess: true, label }));
    const menuPositionerContext = useMenuPositionerContext();
    const { store } = useMenuRootContext();
    const thisTriggerId = $derived(useBaseUiId(idProp, generatedId));
    const open = $derived(store.useState('open'));
    const floatingRootContext = $derived(store.useState('floatingRootContext'));
    const floatingTreeRoot = $derived(store.useState('floatingTreeRoot'));
    const popupId = $derived(store.useState('triggerPopupId', thisTriggerId));
    const baseRegisterTrigger = useTriggerRegistration(() => thisTriggerId, () => store);
    // Stable, so the merged ref on the rendered element keeps its identity for the trigger's whole
    // lifetime; the latest `closeDelay` is read when it runs.
    const registerTrigger = useStableCallback((element: Element | null) => {
        baseRegisterTrigger(element);
        if (element !== null && store.select('open') && store.select('activeTriggerId') == null) {
            store.update({
                activeTriggerId: thisTriggerId ?? null,
                activeTriggerElement: element,
                closeDelay,
            });
        }
    });
    const triggerElementRef = { current: null as HTMLElement | null };
    const handleTriggerElementRef = (el: HTMLElement | null) => {
        triggerElementRef.current = el;
        store.set('activeTriggerElement', el);
    };
    // A stable ref does not re-fire when the id changes, so register the rendered element here
    // instead. On React 17 the id also starts out `undefined`, so this is what registers the trigger
    // at all.
    useIsoLayoutEffect(() => {
        registerTrigger(triggerElementRef.current);
        return () => registerTrigger(null);
    }, () => [registerTrigger, thisTriggerId, store]);
    store.useSyncedValue('closeDelay', () => closeDelay);
    const parentMenuStore = submenuRootContext.parentMenu;
    const rootDisabled = $derived(store.useState('disabled'));
    const parentDisabled = $derived(parentMenuStore.useState('disabled'));
    const disabled = $derived(disabledProp || rootDisabled || parentDisabled);
    if (DEV) {

        useIsoLayoutEffect(() => {
            const element = triggerElementRef.current;
            if (element && isElementDisabled(element) && !disabled) {
                warn(`A disabled element was detected on <Menu.SubmenuTrigger>. To properly disable the trigger, use the \`disabled\` prop on the component instead of setting it on the rendered element.`);
            }
        });
    }
    const itemProps = $derived(parentMenuStore.useState('itemProps'));
    const highlighted = $derived(parentMenuStore.useState('isActive', listItem.index()));
    const itemMetadata = $derived.by(() => ({
        type: 'submenu-trigger' as const,
        setActive() {
            if (parentMenuStore.select('highlightItemOnHover')) {
                parentMenuStore.set('activeIndex', listItem.index());
            }
        },
    }));
    const { getItemProps, itemRef } = useMenuItem(() => ({
        closeOnClick: false,
        disabled,
        highlighted,
        id: thisTriggerId,
        store,
        typingRef: parentMenuStore.context.typingRef,
        nativeButton,
        itemMetadata,
        nodeId: menuPositionerContext?.context.nodeId,
    }));
    const hoverEnabled = $derived(store.useState('hoverEnabled'));
    const hoverProps = useHoverReferenceInteraction(() => floatingRootContext, () => ({
        enabled: hoverEnabled && openOnHover && !disabled,
        handleClose: safePolygon({ blockPointerEvents: true }),
        mouseOnly: true,
        move: true,
        restMs: delay,
        delay: { open: delay, close: closeDelay },
        shouldOpen: delay > 0 ? () => parentMenuStore.select('allowMouseEnter') : undefined,
        triggerElementRef,
        externalTree: floatingTreeRoot,
        isClosing: () => store.select('transitionStatus') === 'ending',
        // Chrome can drop the trigger's `mouseleave` during a fast pointer sweep,
        // leaving a stale submenu open (see #5152) — cancel from `mouseout` too.
        guardStaleOpen: true,
    }));
    const click = useClick(() => floatingRootContext, () => ({
        enabled: !disabled,
        event: 'mousedown',
        toggle: !openOnHover,
        ignoreMouse: openOnHover,
        stickIfOpen: false,
    }));
    const localInteractionProps = $derived(click.reference ?? EMPTY_OBJECT);
    const rootTriggerProps = $derived(store.useState('triggerProps', true));
    const triggerProps = $derived.by(() => { const value = rootTriggerProps; delete value.id; return value; });
    const state: MenuSubmenuTriggerState = $derived({ disabled, highlighted, open });
    const openMethod = $derived(store.useState('openMethod'));
    const lastOpenChangeReason = $derived(store.useState('lastOpenChangeReason'));
    // Arrow keys open the submenu through list navigation without dispatching a click, so
    // `openMethod` stays null there; Enter and Space do dispatch one and report `keyboard`.
    const openedByKeyboard = $derived(lastOpenChangeReason === REASONS.listNavigation || openMethod === 'keyboard');
    const shouldOmitExpanded = $derived(open && openedByKeyboard && platform.screenReader.voiceOver);
    const props = $derived([localInteractionProps, hoverProps(), triggerProps, itemProps, shouldOmitExpanded ? VOICE_OVER_EXPANDED_PROPS : undefined, { 'aria-controls': popupId, tabindex: open || highlighted ? 0 : -1, onfocusout() { if (highlighted)
                parentMenuStore.set('activeIndex', null); } }, elementProps, getItemProps]);
    return { get state() { return state; }, get props() { return props; }, get refs() { return [setRef, listItem.ref, itemRef, registerTrigger, handleTriggerElementRef]; } };
}
