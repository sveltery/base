<!-- Adapted Base UI docs/src/components/ScrollArea.tsx at47b40521; MIT2019 Material-UI SAS. See THIRD_PARTY_NOTICES.md. -->
<script lang="ts">
  import { ScrollArea } from '@sveltery/base/scroll-area';
  import type { Snippet } from 'svelte';
  let { children, class: className = '', viewportClass = 'ScrollAreaViewport', orientation = 'vertical', id, label, tabindex, viewportRef = $bindable<HTMLElement | null>(null) }: { children?: Snippet; class?: string; viewportClass?: string; orientation?: 'vertical' | 'horizontal'; id?: string; label?: string; tabindex?: number; viewportRef?: HTMLElement | null } = $props();
</script>
<ScrollArea.Root class={className} {id} {tabindex} aria-label={label}>
  <ScrollArea.Viewport class={viewportClass} bind:ref={viewportRef}>{@render children?.()}</ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="ScrollAreaScrollbar" {orientation}><ScrollArea.Thumb class="ScrollAreaThumb" /></ScrollArea.Scrollbar>
</ScrollArea.Root>
