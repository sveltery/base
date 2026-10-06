<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/NumberFieldSourceBugBrowserFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLElement>();
  let ready = $state(false);
  let validation = $state<unknown[]>([]);
  onMount(() => {
    ready = true;
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/number-field-source-bug-reference.js').then(
      ({ mountNumberFieldSourceBugReference }) => {
        if (!stopped) cleanup = mountNumberFieldSourceBugReference(node, data.scenario);
      },
    );
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<section bind:this={host}></section>{:else}
  <main data-hydrated={ready}>
    <Fixture
      initial={data.scenario === 'cancel' ? 0 : 2}
      controlled={data.scenario !== 'cancel'}
      cancel={data.scenario === 'cancel'}
      reject={data.scenario === 'decline'}
      options={{ step: 'any', allowWheelScrub: true }}
      validationMode={data.scenario === 'validation' ? 'onChange' : 'onSubmit'}
      onChange={(_value, details) => {
        if (data.scenario === 'validation' && details.reason === 'none') details.cancel();
      }}
      validate={data.scenario === 'validation'
        ? (value) => {
            validation.push({ value });
            return null;
          }
        : undefined}
    />
    <button
      id="clear-validation"
      onclick={() => {
        validation = [];
      }}>Clear</button
    >
    <output id="number-validation-calls">{JSON.stringify(validation)}</output>
  </main>
{/if}
