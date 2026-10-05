<script lang="ts">
  // Original MenuRadioItemIndicator transition/presence composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useMenuRadioItemContext } from './radio-item/MenuRadioItemContext.js';
  import { itemMapping } from './utils/stateAttributesMapping.js';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import type { MenuRadioItemIndicatorProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let {
    render,
    class: className,
    style,
    keepMounted = false,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuRadioItemIndicatorProps = $props();
  const item = useMenuRadioItemContext();
  const indicatorRef = { current: null as HTMLElement | null };
  const transition = useTransitionStatus(() => item.checked);
  useOpenChangeComplete({
    batch: true,
    get enabled() {
      return !item.checked;
    },
    get open() {
      return item.checked;
    },
    ref: indicatorRef,
    onComplete() {
      if (!item.checked) transition.setMounted(false);
    },
  });
  const componentState = $derived({
    checked: item.checked,
    disabled: item.disabled,
    highlighted: item.highlighted,
    transitionStatus: transition.transitionStatus,
  });
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="span"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    ref: [setRef, indicatorRef],
    stateAttributesMapping: itemMapping,
    props: { 'aria-hidden': true, ...elementProps },
    enabled: keepMounted || transition.mounted,
  }}
  {children}
/>
