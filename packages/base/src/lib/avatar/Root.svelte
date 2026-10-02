<script lang="ts">
  // Derived from AvatarRoot at Base UI 1.8.0 pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT: parity/avatar/UPSTREAM_LICENSE.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { setAvatarContext } from './context.js';
  import type { AvatarRootProps, ImageLoadingStatus } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: AvatarRootProps = $props();
  let imageLoadingStatus = $state<ImageLoadingStatus>('idle');
  const partState = $derived({ imageLoadingStatus });
  setAvatarContext({ get imageLoadingStatus() { return imageLoadingStatus; }, setImageLoadingStatus(status) { imageLoadingStatus = status; } });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(partState) : classProp) });
</script>
<Element tag="span" props={resolved} state={partState} {render} {children} bind:ref />
