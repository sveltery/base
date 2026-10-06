<script lang="ts">
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Base UI v1.8.0 SwitchThumb.tsx, native Svelte renderer/context. MIT.
  import { useSwitchRootContext } from '../root/SwitchRootContext.js';
  import { stateAttributesMapping } from '../stateAttributesMapping.js';
  import type { SwitchThumbProps } from '../types.js';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: SwitchThumbProps = $props();
  const getState = useSwitchRootContext();
  const state = $derived(getState());

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style: style },
      elementProps,
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}
