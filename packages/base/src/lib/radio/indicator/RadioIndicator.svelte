<script lang="ts">
import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Base UI v1.8.0 RadioIndicator.tsx source composition; MIT.
  import { useRadioRootContext } from '../root/RadioRootContext.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
  import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
  import type { RadioIndicatorProps, RadioIndicatorState } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    keepMounted = false,
    children,
    ref = $bindable(),
    ...elementProps
  }: RadioIndicatorProps = $props();
  const getRootState = useRadioRootContext();
  const rendered = $derived(getRootState().checked);
  const transition = useTransitionStatus(() => rendered);
  const indicatorState: RadioIndicatorState = $derived({
    ...getRootState(),
    transitionStatus: transition.transitionStatus,
  });
  const indicatorRef = $state<{ current: HTMLElement | null }>({ current: null });
  const shouldRender = $derived(keepMounted || transition.mounted);
  useOpenChangeComplete({
    batch: true,
    get enabled() {
      return !rendered;
    },
    get open() {
      return rendered;
    },
    ref: indicatorRef,
    onComplete() {
      if (!rendered) transition.setMounted(false);
    },
  });
  
  
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    indicatorRef.current = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
      if (indicatorRef.current === host) indicatorRef.current = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(indicatorState, { class: classProp, style: style }, elementProps, stateAttributesMapping), [hostAttachmentKey]: attachHost });
</script>
{#if shouldRender}{#if render}
  {@render render(mergedProps, indicatorState, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}{/if}
