<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  let { stable, events }: { stable: () => string; events: string[] } = $props();
  const attachmentKey = createAttachmentKey();
  untrack(() => events.push(`child-setup:${stable()}`));
  $effect(() => {
    events.push(`child-effect:${stable()}`);
    return () => {
      events.push('child-cleanup');
    };
  });
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
