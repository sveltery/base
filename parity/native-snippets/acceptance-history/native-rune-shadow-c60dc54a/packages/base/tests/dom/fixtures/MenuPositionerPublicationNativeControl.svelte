<script lang="ts">
  // Plain native function-binding/attachment control; zero Original assertion credit.
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  let {
    ref = $bindable(null),
    revision,
  }: {
    ref?: HTMLElement | null;
    revision: number;
  } = $props();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          ref = null;
        });
    });
  }
  const props = { [createAttachmentKey()]: attachHost };
</script>

{#key revision}
  <section {...props} id={`publication-positioner-${revision}`}></section>
{/key}
