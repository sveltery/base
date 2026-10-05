<script lang="ts">
  import { ScrollArea } from '../../src/lib/scroll-area/index.js';
  let { part }: { part: 'content' | 'thumb' } = $props();
</script>
<ScrollArea.Root>{#if part === 'content'}<ScrollArea.Content />{:else}<ScrollArea.Thumb />{/if}</ScrollArea.Root>
