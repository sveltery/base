<script lang="ts">
  // Native Svelte controlled/value binding characterization; no Input runtime changes.
  import { Input } from '@sveltery/base/input';
  import InputOwnedFinalWrapper from './input-timing/InputOwnedFinalWrapper.svelte';
  import type { TimingDecision, TimingFramework, TimingRecorder } from './input-timing/types.js';
  let {
    framework,
    decision,
    record,
    preventBase = false,
  }: {
    framework: Exclude<TimingFramework, 'react'>;
    decision: TimingDecision;
    record: TimingRecorder;
    preventBase?: boolean;
  } = $props();
  let owner = $state('owner');
  function decide(next: string) {
    if (decision === 'accept') owner = next;
    else if (decision === 'rewrite') owner = next.toUpperCase();
    else owner = 'owner';
  }
  function callback(next: string) {
    record('callback:before-owner', next);
    decide(next);
    record('callback:after-owner', next);
  }
</script>

{#snippet finalWrapper(props: Record<string | symbol, unknown>)}
  <input
    {...props as import('svelte/elements').HTMLInputAttributes}
    oninput={(event) => {
      // Fixture-only feasibility prototype: own the final native handler after composition.
      // The consumer callback updates the fixture owner synchronously, so flushSync is unnecessary.
      try {
        (props.oninput as (event: Event) => void)(event);
      } finally {
        if (event.currentTarget.value !== owner) event.currentTarget.value = owner;
      }
    }}
  />
{/snippet}
<form data-testid="timing-form">
  {#if framework === 'input-owned-final-wrapper'}
    <InputOwnedFinalWrapper
      name="field"
      value={owner}
      onValueChange={callback}
      oninput={(event) => {
        if (preventBase) {
          record('consumer:prevent-base');
          event.preventBaseUIHandler();
        }
      }}
      data-testid="timing-input"
    />
  {:else if framework === 'input-final-wrapper'}
    <Input
      name="field"
      value={owner}
      onValueChange={callback}
      render={finalWrapper}
      data-testid="timing-input"
    />
  {:else if framework === 'input'}
    <Input
      name="field"
      value={owner}
      onValueChange={callback}
      oninput={(event) => {
        if (preventBase) {
          record('consumer:prevent-base');
          event.preventBaseUIHandler();
        }
      }}
      data-testid="timing-input"
    />
  {:else if framework === 'native-value'}
    <input
      name="field"
      value={owner}
      oninput={(event) => callback(event.currentTarget.value)}
      data-testid="timing-input"
    />
  {:else if framework === 'native-bind'}
    <input
      name="field"
      bind:value={owner}
      oninput={(event) => callback(event.currentTarget.value)}
      data-testid="timing-input"
    />
  {:else}
    <input name="field" bind:value={() => owner, callback} data-testid="timing-input" />
  {/if}
</form>
<output data-testid="timing-owner">{owner}</output>
