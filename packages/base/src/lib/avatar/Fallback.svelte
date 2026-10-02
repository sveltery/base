<script lang="ts">
  // Derived from pinned AvatarFallback/useTimeout. MIT: parity/avatar/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getAvatarContext } from './context.js';
  import type { AvatarFallbackProps } from './types.js';
  let { children, render, delay = 0, class: classProp, ref = $bindable(), ...props }: AvatarFallbackProps = $props();
  const root = getAvatarContext();
  let delayPassed = $state(untrack(() => delay === 0));
  const partState = $derived({ imageLoadingStatus: root.imageLoadingStatus });
  const visible = $derived(partState.imageLoadingStatus !== 'loaded' && (delay === 0 || delayPassed));
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(partState) : classProp) });
  $effect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => { delayPassed = true; }, delay);
      return () => clearTimeout(timer);
    }
    delayPassed = true;
  });
</script>
{#if visible}<Element tag="span" props={resolved} state={partState} {render} {children} bind:ref />{/if}
