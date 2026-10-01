<script lang="ts">
  // Source-derived supplements; no complete upstream leaf credit.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  import type { Actions, ChangeEventDetails } from '@sveltery/base/dialog';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let visible = $state(true);
  let actions = $state<Actions | null>(null);
  let requests = $state<{ open: boolean; reason: string; trigger: string | null; type: string; target: string | null; related: string | null }[]>([]);
  function change(open: boolean, details: ChangeEventDetails) {
    const event = details.event as FocusEvent;
    requests.push({ open, reason: details.reason, trigger: details.trigger?.id ?? null, type: event.type, target: (event.target as HTMLElement | null)?.id || null, related: (event.relatedTarget as HTMLElement | null)?.id || null });
  }
  function commands(node: HTMLElement) {
    const host = node as HTMLElement & { nonmodalCommand?: (command: string) => void };
    host.nonmodalCommand = command => { if (command === 'remove') visible = false; else if (command === 'close') actions?.close(); };
    return () => { delete host.nonmodalCommand; };
  }
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated} {@attach commands}>
  <button id="before">Before</button>
  <Dialog.Root modal={scenario === 'trap' ? 'trap-focus' : false} disablePointerDismissal={scenario === 'disabled'} bind:actions onOpenChange={change}>
    <Dialog.Trigger id="nonmodal-a">Trigger A</Dialog.Trigger>
    {#if scenario === 'multiple'}<Dialog.Trigger id="nonmodal-b">Trigger B</Dialog.Trigger>{/if}
    {#if visible}<Dialog.Portal keepMounted={scenario === 'keep'}>
      <Dialog.Popup initialFocus={scenario === 'entry' ? false : undefined} style="position:relative;z-index:1">
        <input id="first" aria-label="First" tabindex="0" />
        <button id="last" tabindex="0">Last</button>
      </Dialog.Popup>
    </Dialog.Portal>{/if}
  </Dialog.Root>
  <button id="after">After</button>
  <button id="end">End</button>
  <output data-testid="requests">{JSON.stringify(requests)}</output>
</main>
