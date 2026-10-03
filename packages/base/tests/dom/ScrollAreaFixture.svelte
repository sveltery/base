<script lang="ts">
  // Original six part assertion fixture adaptation; MIT: parity/scroll-area/UPSTREAM_LICENSE.
  import { ScrollArea } from '../../src/lib/scroll-area/index.js';
  import { DirectionProvider } from '../../src/lib/direction-provider/index.js';
  import { CSPProvider } from '../../src/lib/csp-provider/index.js';
  import type { ScrollAreaRootProps } from '../../src/lib/scroll-area/types.js';
  let { direction = 'ltr', threshold = 0, preventMove = false, noViewport = false, nonce, disableStyleElements = false }: { direction?: 'ltr' | 'rtl'; threshold?: ScrollAreaRootProps['overflowEdgeThreshold']; preventMove?: boolean; noViewport?: boolean; nonce?: string; disableStyleElements?: boolean } = $props();
</script>
<DirectionProvider {direction}><CSPProvider {nonce} {disableStyleElements}>
  <ScrollArea.Root data-testid="root" overflowEdgeThreshold={threshold}>
    {#if !noViewport}<ScrollArea.Viewport data-testid="viewport" style={{ scrollSnapType: 'y mandatory' }}><ScrollArea.Content data-testid="content">Content</ScrollArea.Content></ScrollArea.Viewport>{/if}
    <ScrollArea.Scrollbar keepMounted data-testid="vertical"><ScrollArea.Thumb data-testid="vertical-thumb" onpointermove={event => { if (preventMove) event.preventBaseUIHandler(); }} /></ScrollArea.Scrollbar>
    <ScrollArea.Scrollbar orientation="horizontal" keepMounted data-testid="horizontal"><ScrollArea.Thumb data-testid="horizontal-thumb" /></ScrollArea.Scrollbar>
    <ScrollArea.Corner data-testid="corner" />
  </ScrollArea.Root>
</CSPProvider></DirectionProvider>
