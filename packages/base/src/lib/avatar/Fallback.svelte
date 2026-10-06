<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Derived from pinned AvatarFallback/useTimeout. MIT: parity/avatar/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import { getAvatarContext } from './context.js';
  import { avatarStateAttributesMapping } from './stateAttributesMapping.js';
  import type { AvatarFallbackProps } from './types.js';
  let {
    children,
    render,
    delay = 0,
    class: classProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: AvatarFallbackProps = $props();
  const root = getAvatarContext();
  let delayPassed = $state(untrack(() => delay === 0));
  const partState = $derived({ imageLoadingStatus: root.imageLoadingStatus });
  const visible = $derived(
    partState.imageLoadingStatus !== 'loaded' && (delay === 0 || delayPassed),
  );

  $effect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        delayPassed = true;
      }, delay);
      return () => clearTimeout(timer);
    }
    delayPassed = true;
  });

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
  const renderEnabled = $derived(visible);
  const mergedProps = $derived({
    ...mergeComponentProps(
      partState,
      { class: classProp, style: style },
      elementProps,
      avatarStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if renderEnabled}
  {#if render}
    {@render render(mergedProps, partState, children)}
  {:else}
    <span {...mergedProps}>{@render children?.()}</span>
  {/if}
{/if}
