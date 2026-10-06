<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Fixture from '../../lib/PopupFamilyFixture.svelte';
  import type { mountPopupFamilyReference } from '../../lib/popup-family-reference.js';
  import type { load } from './+page.js';
  let { data }: { data: ReturnType<typeof load> } = $props();
  let host = $state<HTMLElement>();
  let fixture = $state<{ command(value: string): void; snapshot(): object }>();
  const calls: unknown[] = [];
  const log = (kind: string, value: unknown, reason?: string, triggerId?: string) =>
    calls.push([kind, value, reason, triggerId]);
  onMount(() => {
    if (!host) return;
    const node = host;
    let stopped = false;
    let reference: ReturnType<typeof mountPopupFamilyReference> | undefined;
    Object.assign(node, {
      popupCommand: (value: string) => (reference ?? fixture)?.command(value),
      popupSnapshot: () => ({ ...(reference ?? fixture)?.snapshot(), calls }),
    });
    if (data.reference)
      void import('../../lib/popup-family-reference.js').then(({ mountPopupFamilyReference }) => {
        if (!stopped) {
          reference = mountPopupFamilyReference(node, { ...data, log });
          node.dataset.hydrated = 'true';
        }
      });
    else
      void tick().then(() => {
        if (!stopped) node.dataset.hydrated = 'true';
      });
    return () => {
      stopped = true;
      reference?.stop();
    };
  });
</script>

<main bind:this={host}
  >{#if !data.reference}<Fixture {...data} {log} bind:this={fixture} />{/if}</main
>

<style>
  :global([data-testid='popup']) {
    background: white;
    color: black;
    border: 1px solid black;
    padding: 8px;
  }
  :global([data-testid='arrow']) {
    width: 10px;
    height: 10px;
  }
  :global(#before),
  :global(#opener),
  :global(#second),
  :global(#outside) {
    margin: 8px;
  }
  :global([data-current]) {
    animation: enter 800ms linear;
  }
  :global([data-previous]) {
    animation: leave 800ms linear;
  }
  @keyframes enter {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes leave {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.8;
    }
  }
</style>
