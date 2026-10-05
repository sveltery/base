<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import { useIsoLayoutEffect } from '../../src/lib/utils/useIsoLayoutEffect.svelte.js';
  let { stable, events }: { stable: () => string; events: string[] } = $props();
  const attachmentKey = createAttachmentKey();
  untrack(() => events.push(`child-setup:${stable()}`));
  useIsoLayoutEffect(
    () => {
      events.push(`child-effect:${stable()}`);
      return () => {
        events.push('child-cleanup');
      };
    },
    () => [stable],
  );
  const refProps = {
    [attachmentKey]: () => {
      events.push(`attachment:${stable()}`);
      return () => {
        events.push('attachment-cleanup');
      };
    },
  };
</script>

<input {...refProps} aria-label="helper fixture" />
