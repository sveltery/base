<script lang="ts">
  // Derived from AvatarRoot at Base UI 1.8.0 pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT: parity/avatar/UPSTREAM_LICENSE.
  import RenderElement from '../internals/RenderElement.svelte';
  import { setAvatarContext } from './context.js';
  import { avatarStateAttributesMapping } from './stateAttributesMapping.js';
  import type { AvatarRootProps, ImageLoadingStatus } from './types.js';
  let { children, render, class: classProp, style, ref = $bindable(), ...elementProps }: AvatarRootProps = $props();
  let imageLoadingStatus = $state<ImageLoadingStatus>('idle');
  const partState = $derived({ imageLoadingStatus });
  setAvatarContext({ get imageLoadingStatus() { return imageLoadingStatus; }, setImageLoadingStatus(status) { imageLoadingStatus = status; } });
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state: partState, props: elementProps, stateAttributesMapping: avatarStateAttributesMapping });
</script>
<RenderElement tag="span" {componentProps} {params} {children} bind:element={ref} />
