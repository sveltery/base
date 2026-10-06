<script lang="ts">
  // Adapted from Base UI v1.8.0 AccordionItem/useCollapsibleRoot/useTransitionStatus.
  // Immutable pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { setCollapsibleContext } from '../collapsible/context.js';
  import type { CollapsibleTransitionStatus } from '../collapsible/types.js';
  import { getAccordionRootContext, setAccordionItemContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type {
    AccordionItemProps,
    AccordionItemState,
    AccordionItemChangeEventDetails,
  } from './types.js';

  let {
    children,
    render,
    value: valueProp,
    disabled: disabledProp = false,
    onOpenChange,
    class: classProp,
    ref = $bindable(),
    ...props
  }: AccordionItemProps = $props();
  const root = getAccordionRootContext();
  const generatedId = $props.id();
  const fallbackValue = `base-ui-${generatedId}`;
  const value = $derived(valueProp ?? fallbackValue);
  const disabled = $derived(disabledProp || root.disabled);
  const open = $derived(root.value.indexOf(value) !== -1);
  let index = $state(-1);
  let retainedMounted = $state(untrack(() => open));
  let phase = $state<CollapsibleTransitionStatus>(untrack(() => (open ? 'idle' : undefined)));
  const mounted = $derived(open || retainedMounted);
  const transitionStatus = $derived(
    open && !retainedMounted
      ? 'starting'
      : !open && !mounted && phase === 'ending'
        ? undefined
        : phase,
  );
  const collapsibleState = $derived({ open, disabled, transitionStatus });
  const itemState: AccordionItemState = $derived({
    ...root.state,
    hidden: !open && !mounted,
    index,
    disabled,
    open,
  });
  const defaultPanelId = `base-ui-${generatedId}-panel`;
  let registeredPanelId = $state<string | null | undefined>(undefined);
  const panelId = $derived(
    registeredPanelId === null ? undefined : (registeredPanelId ?? defaultPanelId),
  );
  const defaultTriggerId = `base-ui-${generatedId}-trigger`;
  let registeredTriggerId = $state<string | null | undefined>(undefined);
  const triggerId = $derived(
    registeredTriggerId === null ? undefined : (registeredTriggerId ?? defaultTriggerId),
  );
  let committedOpen = untrack(() => open);
  let committedValue = untrack(() => value);
  let committedCallback = untrack(() => onOpenChange);

  function requestOpenChange(next: boolean, details: AccordionItemChangeEventDetails) {
    const callback = committedCallback;
    const itemValue = committedValue;
    callback?.(next, details);
    if (details.isCanceled) return;
    root.handleValueChange(itemValue, next, details);
  }
  const collapsible = {
    get open() {
      return open;
    },
    get disabled() {
      return disabled;
    },
    get mounted() {
      return mounted;
    },
    get transitionStatus() {
      return transitionStatus;
    },
    get state() {
      return collapsibleState;
    },
    get defaultPanelId() {
      return defaultPanelId;
    },
    get registeredPanelId() {
      return registeredPanelId;
    },
    get panelId() {
      return panelId;
    },
    // Every Accordion item supplies a controlled open value to Collapsible.
    setOpen(_next: boolean) {},
    // Preserve the source's idle status after an unanimated close (#33).
    setMounted(next: boolean) {
      retainedMounted = next;
      if (!next && !open && phase === 'ending') phase = undefined;
    },
    onOpenChange: requestOpenChange,
    handleTrigger(event: MouseEvent | KeyboardEvent) {
      const next = !committedOpen;
      const details = createChangeEventDetails('trigger-press', event);
      requestOpenChange(next, details);
      if (!details.isCanceled) collapsible.setOpen(next);
    },
    setPanelIdState(
      next:
        | string
        | null
        | undefined
        | ((current: string | null | undefined) => string | null | undefined),
    ) {
      registeredPanelId = typeof next === 'function' ? next(registeredPanelId) : next;
    },
  };
  setCollapsibleContext(collapsible);
  setAccordionItemContext({
    get state() {
      return itemState;
    },
    get open() {
      return open;
    },
    get defaultTriggerId() {
      return defaultTriggerId;
    },
    get triggerId() {
      return triggerId;
    },
    setTriggerId(
      next:
        | string
        | null
        | undefined
        | ((current: string | null | undefined) => string | null | undefined),
    ) {
      registeredTriggerId = typeof next === 'function' ? next(registeredTriggerId) : next;
    },
  });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(itemState) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
    };
  });
  function attach(node: HTMLElement) {
    return root.registerItem(node, (next) => {
      index = next;
    });
  }
  $effect.pre(() => {
    committedOpen = open;
    committedValue = value;
    committedCallback = onOpenChange;
  });
  // Defer ending styles so the Panel can cache its expanded dimensions first.
  $effect.pre(() => {
    const nextOpen = open;
    const isMounted = mounted;
    const status = transitionStatus;
    if (nextOpen && !untrack(() => retainedMounted)) retainedMounted = true;
    if (nextOpen && status !== 'idle') phase = 'starting';
    if (!nextOpen && (!isMounted || status === 'ending')) return;
    const view = ref?.ownerDocument.defaultView ?? window;
    const frame = view.requestAnimationFrame(() => {
      if (nextOpen === open) phase = nextOpen ? 'idle' : 'ending';
    });
    return () => view.cancelAnimationFrame(frame);
  });
</script>

<Element
  tag="div"
  internal={stateAttributes(itemState)}
  props={resolved}
  state={itemState}
  {render}
  {children}
  bind:ref
  {attach}
/>
