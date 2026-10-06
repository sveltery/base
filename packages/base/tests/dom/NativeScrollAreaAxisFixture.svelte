<script lang="ts">
  import { ScrollArea } from '../../src/lib/scroll-area/index.js';
  import type { ScrollAreaRootContext } from '../../src/lib/scroll-area/root/ScrollAreaRootContext.js';
  import Probe from './NativeScrollAreaProbe.svelte';
  let orientation = $state<'vertical' | 'horizontal'>('vertical');
  let present = $state(true);
  let scrollbar = $state<HTMLElement | null>();
  let thumb = $state<HTMLElement | null>();
  let context: ScrollAreaRootContext | undefined;
  export function setOrientation(value: 'vertical' | 'horizontal') {
    orientation = value;
  }
  export function hide() {
    present = false;
  }
  export function snapshot() {
    return {
      scrollbar,
      thumb,
      x: context?.scrollbarXRef.current,
      y: context?.scrollbarYRef.current,
      thumbX: context?.thumbXRef.current,
      thumbY: context?.thumbYRef.current,
    };
  }
</script>

{#if present}
  <ScrollArea.Root>
    <Probe
      capture={(value) => {
        context = value;
      }}
    />
    <ScrollArea.Viewport
      ><ScrollArea.Content>Scrollable content</ScrollArea.Content></ScrollArea.Viewport
    >
    <ScrollArea.Scrollbar id="native-scrollbar" {orientation} keepMounted bind:ref={scrollbar}>
      <ScrollArea.Thumb id="native-thumb" bind:ref={thumb} />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
{/if}
