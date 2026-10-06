<script lang="ts">
  // Actual native binding and authored attachment lifetimes; zero React ref credit.
  import { createAttachmentKey, type Attachment } from 'svelte/attachments';
  import FocusGuard from '../../src/lib/utils/FocusGuard.svelte';
  import InternalBackdrop from '../../src/lib/utils/InternalBackdrop.svelte';
  let {
    kind = 'guard',
    cutout,
    attachment,
  }: {
    kind?: 'guard' | 'backdrop';
    cutout?: Element;
    attachment?: Attachment<HTMLSpanElement>;
  } = $props();
  let guard = $state<HTMLSpanElement | null | undefined>();
  let backdrop = $state<HTMLDivElement | null | undefined>();
  const attachmentKey = createAttachmentKey();
  export function getRef() {
    return kind === 'guard' ? guard : backdrop;
  }
</script>

{#if kind === 'guard'}
  <FocusGuard bind:ref={guard} {...{ [attachmentKey]: attachment }} />
{:else}
  <InternalBackdrop bind:ref={backdrop} {cutout} style="color: red" />
{/if}
