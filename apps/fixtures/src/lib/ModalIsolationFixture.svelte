<script lang="ts">
  // Supplemental isolation contracts against the pinned React implementation.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let open = $state(false);
  let secondOpen = $state(false);
  let visible = $state(true);
  let popupVisible = $state(true);
  let modal = $state<boolean | 'trap-focus'>(true);
  let body = $state<HTMLElement>();
  function commands(node: HTMLElement) {
    const host = node as HTMLElement & { isolationCommand?: (command: string) => void };
    host.isolationCommand = command => {
      if (command === 'open') open = true;
      if (command === 'second') secondOpen = true;
      if (command === 'close') open = false;
      if (command === 'close-second') secondOpen = false;
      if (command === 'remove') visible = false;
      if (command === 'remove-popup') popupVisible = false;
      if (command === 'false') modal = false;
      if (command === 'trap-focus') modal = 'trap-focus';
      if (command === 'true') modal = true;
    };
    return () => { delete host.isolationCommand; };
  }
  onMount(() => { body = document.body; hydrated = true; });
</script>
<main data-hydrated={hydrated} {@attach commands}>
  <div data-testid="outside-wrapper">
    <button>Outside</button>
    <div data-testid="owned-hidden" aria-hidden="true">Hidden before open</div>
    <div data-testid="owned-false" aria-hidden="false">Initially exposed</div>
    <div data-testid="owned-empty" {@attach node => { node.setAttribute('aria-hidden', ''); }}>Existing empty value</div>
    <div data-testid="owned-inert" inert>Inert before open</div>
    <div data-testid="live-wrapper"><div data-testid="live" aria-live="polite">Announcement</div><button>Live sibling</button></div>
  </div>
  <Dialog.Root {open} {modal} onOpenChange={value => open = value}>
    <Dialog.Trigger>Open first</Dialog.Trigger>
    {#if visible}<Dialog.Portal>{#if popupVisible}<Dialog.Popup data-testid="first" style="position:relative;z-index:1">
      <Dialog.Title>First dialog</Dialog.Title>
      <Dialog.Close>Close first</Dialog.Close>
      {#if scenario !== 'sibling'}
        <Dialog.Root open={secondOpen} onOpenChange={value => secondOpen = value}>
          <Dialog.Trigger>Open second</Dialog.Trigger>
          <Dialog.Portal container={scenario === 'nested-body' ? body : undefined}>
            <Dialog.Popup data-testid="second" style="position:relative;z-index:2"><Dialog.Title>Second dialog</Dialog.Title><Dialog.Close>Close second</Dialog.Close></Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      {/if}
    </Dialog.Popup>{/if}</Dialog.Portal>{/if}
  </Dialog.Root>
  {#if scenario === 'sibling'}
    <Dialog.Root open={secondOpen} onOpenChange={value => secondOpen = value}>
      <Dialog.Trigger>Open second</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup data-testid="second" style="position:relative;z-index:2"><Dialog.Title>Second dialog</Dialog.Title><Dialog.Close>Close second</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>
  {/if}
</main>
