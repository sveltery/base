<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { readResetEffects, saveReset, type Input } from './reset.remote.js';
  let { data } = $props();
  const config = untrack(() => data);
  const remote = saveReset.for(config.instance);
  const counter = readResetEffects();
  let hydrated = $state(false);
  let resets = $state(0);
  let customCalls = $state(0);
  let validations = $state(0);
  let counterReads = $state(0);
  let observedEffects = $state(0);
  let gate = $state<(() => void) | null>(null);
  const descriptor = config.custom
    ? remote.enhance(async (submission) => {
        customCalls++;
        if ((await submission.submit().updates()) && !config.gated) {
          await tick();
          HTMLFormElement.prototype.reset.call(submission.element);
        }
      })
    : remote;
  if (config.gated || config.issues)
    remote.preflight({
      '~standard': {
        version: 1,
        vendor: 'sdk-reset-preflight',
        types: undefined as unknown as { input: Input; output: Input },
        validate(value: unknown) {
          const input = value as Input;
          if (config.gated)
            return new Promise<{ value: Input }>((resolve) => {
              gate = () => resolve({ value: input });
            });
          return { issues: [{ message: 'Client checkbox issue', path: ['enabled'] }] };
        },
      },
    });
  async function refreshCounter() {
    await counter.refresh();
    observedEffects = await counter;
    counterReads++;
  }
  async function validate() {
    await remote.validate({ preflightOnly: true });
    validations++;
  }
  function onreset(event: Event) {
    resets++;
    if (config.cancel) event.preventDefault();
  }
  onMount(() => {
    void refreshCounter().then(() => {
      hydrated = true;
    });
  });
</script>

<main data-hydrated={hydrated}>
  <form id="reset-form" {...descriptor} {onreset}>
    <input {...remote.fields.id.as('hidden', config.instance)} />
    <label>Label <input id="reset-label" {...remote.fields.label.as('text', 'seed')} /></label>
    <label>Enabled <input id="reset-enabled" {...remote.fields.enabled.as('checkbox')} /></label>
    <button type="reset">Native reset</button>
    <button type="submit">Submit</button>
  </form>
  <button
    onclick={() => {
      remote.fields.label.set('replacement');
      remote.fields.enabled.set(true);
    }}>Set edited values</button
  >
  <button
    onclick={() => {
      if (remote.element) HTMLFormElement.prototype.reset.call(remote.element);
    }}>Programmatic reset</button
  >
  <button onclick={validate}>Validate touched fields</button>
  <button onclick={refreshCounter}>Read server counter</button>
  {#if gate}<button
      onclick={() => {
        gate?.();
        gate = null;
      }}>Release preflight</button
    >{/if}
  <output id="reset-owner">{JSON.stringify(remote.fields.value())}</output>
  <output id="reset-issues">{JSON.stringify(remote.fields.allIssues() ?? [])}</output>
  <output id="reset-result">{JSON.stringify(remote.result ?? null)}</output>
  <output id="reset-pending">{remote.pending}</output>
  <output id="reset-submitted">{String(remote.submitted)}</output>
  <output id="reset-events">{resets}</output>
  <output id="reset-custom-calls">{customCalls}</output>
  <output id="reset-validations">{validations}</output>
  <output id="reset-counter-reads">{counterReads}</output>
  <output id="reset-effects">{observedEffects}</output>
</main>
