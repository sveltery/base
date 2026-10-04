<script lang="ts">
  // Derived from pinned AvatarFallback/useTimeout. MIT: parity/avatar/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import RenderElement from '../internals/RenderElement.svelte';
  import { getAvatarContext } from './context.js';
  import { avatarStateAttributesMapping } from './stateAttributesMapping.js';
  import type { AvatarFallbackProps } from './types.js';
  let { children, render, delay = 0, class: classProp, style, ref = $bindable(), ...elementProps }: AvatarFallbackProps = $props();
  const root = getAvatarContext();
  let delayPassed = $state(untrack(() => delay === 0));
  const partState = $derived({ imageLoadingStatus: root.imageLoadingStatus });
  const visible = $derived(partState.imageLoadingStatus !== 'loaded' && (delay === 0 || delayPassed));
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state: partState, props: elementProps, stateAttributesMapping: avatarStateAttributesMapping, enabled: visible });
  $effect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => { delayPassed = true; }, delay);
      return () => clearTimeout(timer);
    }
    delayPassed = true;
  });
</script>
<RenderElement tag="span" {componentProps} {params} {children} bind:element={ref} />
