<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Derived from AvatarRoot at Base UI 1.8.0 pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT: parity/avatar/UPSTREAM_LICENSE.
  import { setAvatarContext } from './context.js';
  import { avatarStateAttributesMapping } from './stateAttributesMapping.js';
  import type { AvatarRootProps, ImageLoadingStatus } from './types.js';
  let { children, render, class: classProp, style, ref = $bindable(), ...elementProps }: AvatarRootProps = $props();
  let imageLoadingStatus = $state<ImageLoadingStatus>('idle');
  const partState = $derived({ imageLoadingStatus });
  setAvatarContext({ get imageLoadingStatus() { return imageLoadingStatus; }, setImageLoadingStatus(status) { imageLoadingStatus = status; } });
  
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(partState, { class: classProp, style: style }, elementProps, avatarStateAttributesMapping), [hostAttachmentKey]: attachHost });
</script>
{#if render}
  {@render render(mergedProps, partState, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}
