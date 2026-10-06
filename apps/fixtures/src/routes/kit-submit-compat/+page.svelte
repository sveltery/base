<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';
  import { Field } from '@sveltery/base/field';
  import { Form, type FormState } from '@sveltery/base/form';
  import { saveCompat, readEffects, type Input } from './submit.remote.js';
  let { data } = $props();
  // Each browser case loads a distinct page/instance; enhancement belongs to that lifetime.
  const config = untrack(() => data);
  const remote = saveCompat.for(config.instance);
  const counter = readEffects();
  let hydrated = $state(false);
  let canceled = $state(config.cancel);
  let resets = $state(0);
  let consumerCalls = $state(0);
  let customCalls = $state(0);
  let customResults = $state<unknown[]>([]);
  let observedEffects = $state(0);
  let counterReads = $state(0);
  let preflightCalls = $state(0);
  let gates = $state<{ intent: string; release: () => void }[]>([]);
  const descriptor = config.custom
    ? remote.enhance(async (submission) => {
        customCalls++;
        if (await submission.submit().updates()) {
          customResults.push(submission.result);
          if (config.customReset) submission.element.reset();
        }
      })
    : remote;
  if (config.gated)
    remote.preflight({
      '~standard': {
        version: 1,
        vendor: 'sdk-submit-gates',
        types: undefined as unknown as { input: Input; output: Input },
        validate(value: unknown) {
          const input = value as Input;
          preflightCalls++;
          return new Promise<{ value: Input }>((resolve) => {
            gates.push({ intent: input.intent, release: () => resolve({ value: input }) });
          });
        },
      },
    });
  async function refreshCounter() {
    await counter.refresh();
    observedEffects = await counter;
    counterReads++;
  }
  function onsubmit(event: SubmitEvent) {
    consumerCalls++;
    if (canceled) event.preventDefault();
  }
  onMount(() => {
    void refreshCounter().then(() => {
      hydrated = true;
    });
  });
</script>

{#snippet replacement(
  props: HTMLFormAttributes & Record<string | symbol, unknown>,
  _state: FormState,
  children: Snippet | undefined,
)}
  <form {...props}>{@render children?.()}</form>
{/snippet}
{#snippet controls()}
  <input {...remote.fields.id.as('hidden', config.instance)} />
  {#if config.mode === 'native'}
    <label for="compat-email">Email</label>
    <input id="compat-email" {...remote.fields.email.as('email', 'seed@example.com')} />
  {:else}
    <Field.Root
      name="email"
      validate={(value) => (value === 'blocked@example.com' ? 'Blocked by Field' : null)}
    >
      <Field.Label>Email</Field.Label>
      <Field.Control id="compat-email" {...remote.fields.email.as('email', 'seed@example.com')} />
      <Field.Error id="compat-error" />
    </Field.Root>
  {/if}
  <button {...remote.fields.intent.as('submit', 'one')}>Submit one</button>
  <button {...remote.fields.intent.as('submit', 'two')}>Submit two</button>
{/snippet}
<main data-hydrated={hydrated}>
  {#if config.mode === 'native'}
    <form id="compat-form" {...descriptor} {onsubmit} onreset={() => resets++}>
      {@render controls()}
    </form>
  {:else}
    <Form
      id="compat-form"
      {...descriptor}
      {onsubmit}
      onreset={() => resets++}
      render={config.mode === 'replacement' ? replacement : undefined}
    >
      {@render controls()}
    </Form>
  {/if}
  <button
    onclick={() => {
      canceled = false;
    }}>Allow submission</button
  >
  <button onclick={refreshCounter}>Read server counter</button>
  {#each gates as gate (gate.release)}
    <button
      onclick={() => {
        gate.release();
        gates = gates.filter((item) => item !== gate);
      }}>Release {gate.intent}</button
    >
  {/each}
  <output id="compat-result">{JSON.stringify(remote.result ?? null)}</output>
  <output id="compat-resets">{resets}</output>
  <output id="compat-consumer-calls">{consumerCalls}</output>
  <output id="compat-custom-calls">{customCalls}</output>
  <output id="compat-custom-results">{JSON.stringify(customResults)}</output>
  <output id="compat-pending">{remote.pending}</output>
  <output id="compat-submitted">{String(remote.submitted)}</output>
  <output id="compat-attached">{String(hydrated && remote.element !== null)}</output>
  <output id="compat-preflight-calls">{preflightCalls}</output>
  <output id="compat-effects">{observedEffects}</output>
  <output id="compat-counter-reads">{counterReads}</output>
</main>
