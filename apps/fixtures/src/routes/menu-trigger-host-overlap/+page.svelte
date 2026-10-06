<!-- Actual native outro and immutable Original ordinary replacement browser witness. -->
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Fixture from '../../lib/MenuTriggerHostOverlapFixture.svelte';
  import type { mountMenuTriggerHostOverlapReference } from '../../lib/menu-trigger-host-overlap-reference.js';
  let { data } = $props();
  let host = $state<HTMLElement>();
  let fixture = $state<{
    swapHost(): void;
    removeTrigger(): void;
    snapshot(): object;
    recordedPhases(): readonly object[];
  }>();
  onMount(() => {
    if (!host) return;
    const node = host;
    let stopped = false;
    let reference: ReturnType<typeof mountMenuTriggerHostOverlapReference> | undefined;
    Object.assign(node, {
      hostCommand: (value: string) => {
        if (value === 'swap') (reference ?? fixture)?.swapHost();
        if (value === 'remove') (reference ?? fixture)?.removeTrigger();
      },
      hostSnapshot: () => (reference ?? fixture)?.snapshot(),
      hostRecordedPhases: () => fixture?.recordedPhases() ?? [],
    });
    if (data.reference)
      void import('../../lib/menu-trigger-host-overlap-reference.js').then(
        ({ mountMenuTriggerHostOverlapReference }) => {
          if (!stopped) {
            reference = mountMenuTriggerHostOverlapReference(node);
            node.dataset.hydrated = 'true';
          }
        },
      );
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
  >{#if !data.reference}<Fixture bind:this={fixture} />{/if}</main
>
