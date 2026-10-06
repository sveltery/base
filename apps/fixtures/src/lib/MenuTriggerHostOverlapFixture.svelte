<!-- Authored native host/outro lifetime witness; zero unchanged Original assertion credit. -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { flushSync } from 'svelte';
  import { Menu } from '@sveltery/base/menu';
  const handle = Menu.createHandle();
  let swapped = $state(false);
  let shown = $state(true);
  let host = $state.raw<HTMLElement | null>(null);
  let previousHost: HTMLElement | null = null;
  let replacementHost = $state.raw<HTMLElement | null>(null);
  let scope = $state<HTMLElement>();
  let oldOutroEnded = $state(false);
  const phases: Readonly<ReturnType<typeof phaseSnapshot>>[] = [];

  function phaseSnapshot(phase: string) {
    const registered = handle.store.context.triggerElements.getById('host-overlap-trigger');
    return Object.freeze({
      phase,
      boundHost: host?.dataset.host ?? null,
      registeredHost: (registered as HTMLElement | undefined)?.dataset.host ?? null,
      boundIsPrevious: previousHost !== null && host === previousHost,
      registeredIsPrevious: previousHost !== null && registered === previousHost,
      boundIsReplacement: host !== null && host === replacementHost,
      registeredIsReplacement: replacementHost !== null && registered === replacementHost,
      beforeConnected: previousHost?.isConnected ?? false,
      replacementConnected: replacementHost?.isConnected ?? false,
      beforeHostCount: scope?.querySelectorAll('[data-host="before"]').length ?? 0,
      afterHostCount: scope?.querySelectorAll('[data-host="after"]').length ?? 0,
      oldOutroEnded,
    });
  }
  function recordPhase(phase: string) {
    const value = phaseSnapshot(phase);
    phases.push(value);
    return value;
  }
  function handleOldOutroStart() {
    // Capture the actual event and host publications within one native browser lifetime.
    flushSync();
    recordPhase('outrostart');
  }
  export function recordedPhases() {
    return Object.freeze([...phases]);
  }

  export function swapHost() {
    previousHost = host;
    recordPhase('before-swap');
    flushSync(() => {
      swapped = true;
    });
    recordPhase('replacement-published-after-flush');
  }
  export function removeTrigger() {
    shown = false;
  }
  export function snapshot() {
    const registered = handle.store.context.triggerElements.getById('host-overlap-trigger');
    return {
      boundHost: host?.dataset.host ?? null,
      registeredHost: (registered as HTMLElement | undefined)?.dataset.host ?? null,
      oldOutroEnded,
      beforeConnected: previousHost?.isConnected ?? false,
      currentConnected: host?.isConnected ?? false,
      boundIsReplacement: host !== null && host === replacementHost,
      registeredIsReplacement: replacementHost !== null && registered === replacementHost,
    };
  }
  export function boundHost() {
    return host;
  }
  export function triggerMap() {
    return handle.store.context.triggerElements;
  }
  export function didOldOutroEnd() {
    return oldOutroEnded;
  }
</script>

<section bind:this={scope}>
  <Menu.Root {handle}>
    {#if shown}<Menu.Trigger id="host-overlap-trigger" nativeButton={false} bind:ref={host}>
        {#snippet render(props)}
          {#if swapped}
            <a {...props} bind:this={replacementHost} href="#host-overlap" data-host="after">Open</a
            >
          {:else}
            <button
              {...props}
              type="button"
              data-host="before"
              out:fade={{ duration: 800 }}
              onoutrostart={handleOldOutroStart}
              onoutroend={() => (oldOutroEnded = true)}>Open</button
            >
          {/if}
        {/snippet}
      </Menu.Trigger>{/if}
  </Menu.Root>
</section>
