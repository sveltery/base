<!-- Authored actual Source/native regression; zero Original declaration credit. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import * as Menu from '../../../src/lib/menu/index.parts.ts';
  import { focusValue, type FinalFocus } from './menuFocusValues.js';
  let { mode, log }: { mode: string; log: (value: string) => void } = $props();
  let actions = $state<{ unmount(): void; close(): void } | null>(null);
  const liveRef = { current: null as HTMLElement | null };
  let generation = 0;
  let cancelNext = false;
  let finalFocus = $state.raw<FinalFocus>(untrack(() => focusValue(mode, generation, log, liveRef)));
  export function replace() {
    generation += 1;
    if (mode === 'mutate-ref') liveRef.current = document.getElementById('new-target');
    else finalFocus = focusValue(mode, generation, log, liveRef);
  }
  export function cancelClose() { cancelNext = true; }
  export function close() { actions?.close(); }
  export function reopen() { document.getElementById('opener')!.click(); }
  export function finish() { actions?.unmount(); }
</script>
<button id="old-target" bind:this={liveRef.current}>Old</button>
<button id="new-target">New</button>
<button id="latest-target">Latest</button>
<Menu.Root defaultOpen bind:actions onOpenChange={(open, details) => {
  if (!open) {
    details.preventUnmountOnClose();
    if (cancelNext) { cancelNext = false; details.cancel(); }
  }
}}>
  <Menu.Trigger id="opener">Open</Menu.Trigger>
  <Menu.Portal><Menu.Positioner><Menu.Popup {finalFocus}><Menu.Item id="inside">Inside</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal>
</Menu.Root>
