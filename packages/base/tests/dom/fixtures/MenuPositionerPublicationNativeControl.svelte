<script lang="ts">
  // Plain native function-binding/attachment control; zero Original assertion credit.
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  let {
    // eslint-disable-next-line no-useless-assignment -- $bindable enables native host/null publication to the parent.
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
  const attachmentProps = { [createAttachmentKey()]: attachHost };
</script>

{#key revision}
  <section {...attachmentProps} id={`publication-positioner-${revision}`}></section>
{/key}
