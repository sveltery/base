<script lang="ts">
  // Native owner lifetime supplement; no unchanged upstream assertion credit.
  import { fade } from 'svelte/transition';
  import { onDestroy, tick } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { NumberField } from '@sveltery/base/number-field';
  let { scenario }: { scenario: string } = $props();
  let stage = $state(1);
  let nativeButton = $state(true);
  let publishedHost = $state<HTMLElement | null>();
  let outroStarted = $state(0);
  let outroEnded = $state(0);
  let incomingHost = $state<HTMLButtonElement | null>();
  let diagnosticPhase = $state('idle');
  let lifetimeRecords = $state<
    {
      phase: 'start' | 'end';
      outgoingConnected: boolean;
      incomingConnected: boolean;
      publishedHost: string;
      publishedIsIncoming: boolean;
    }[]
  >([]);
  let destroyed = false;
  onDestroy(() => {
    destroyed = true;
  });
  function recordOutro(event: Event, phase: 'start' | 'end') {
    const outgoing = event.currentTarget as HTMLButtonElement;
    if (phase === 'start') outroStarted += 1;
    else outroEnded += 1;
    // Observe real native hosts after Svelte has committed the replacement or disposal.
    void tick().then(() => {
      if (destroyed) return;
      lifetimeRecords.push({
        phase,
        outgoingConnected: outgoing.isConnected,
        incomingConnected: incomingHost?.isConnected ?? false,
        publishedHost: publishedHost?.dataset.ownerHost ?? 'none',
        publishedIsIncoming: publishedHost === incomingHost,
      });
    });
  }
</script>

<NumberField.Root defaultValue={2} locale="en-US">
  <NumberField.Input />
  <NumberField.Increment {nativeButton} bind:ref={publishedHost} render={hosts} />
</NumberField.Root>
<button
  id="owner-publish-replacement"
  onclick={() => {
    stage = 2;
  }}>Publish replacement</button
>
<button
  id="owner-dispose-outgoing"
  onclick={() => {
    stage = 3;
  }}>Dispose outgoing</button
>
<button
  id="owner-begin-outro"
  onclick={() => {
    stage = 3;
  }}>Replace with native outro</button
>
<button
  id="owner-require-nonnative"
  onclick={async () => {
    nativeButton = false;
    await tick();
    if (!destroyed) diagnosticPhase = 'settled';
  }}>Require nonnative host</button
>
<button
  id="owner-require-native"
  onclick={() => {
    nativeButton = true;
  }}>Require native host</button
>
<output id="owner-published-host">{publishedHost?.dataset.ownerHost ?? 'none'}</output>
<output id="owner-outro-state"
  >{JSON.stringify({ started: outroStarted, ended: outroEnded })}</output
>
<output id="owner-lifetime-records">{JSON.stringify(lifetimeRecords)}</output>
<output id="owner-diagnostic-phase">{diagnosticPhase}</output>
{#snippet hosts(props: HTMLButtonAttributes)}
  {#if scenario === 'stepper-owner-outro'}
    {#if stage < 3}
      <button
        {...props}
        data-owner-host="A"
        out:fade={{ duration: 1200 }}
        onoutrostart={(event) => recordOutro(event, 'start')}
        onoutroend={(event) => recordOutro(event, 'end')}>Outgoing increase</button
      >
    {/if}
  {:else if stage < 3}
    <button {...props} data-owner-host="A">Outgoing increase</button>
  {/if}
  {#if stage > 1}
    <button {...props} bind:this={incomingHost} data-owner-host="B">Replacement increase</button>
  {/if}
{/snippet}
