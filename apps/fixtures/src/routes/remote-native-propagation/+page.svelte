<script lang="ts">
  import { onMount } from 'svelte';
  import { saveFieldForm, fieldFormEffectCount } from '../field-form-remote/field-form.remote.js';
  let hydrated = $state(false),
    canceled = $state(true),
    resets = $state(0),
    nativeSubmit = $state(0);
  let counterReads = $state(0),
    observedEffects = $state<number>();
  const counter = fieldFormEffectCount();
  async function refreshCounter() {
    await counter.refresh();
    observedEffects = await counter;
    counterReads++;
  }
  onMount(() => {
    void refreshCounter().then(() => {
      hydrated = true;
    });
  });
</script>

<!-- Native oracle: literal Svelte form/input and the same actual installed Kit attachment.
     No Base Form, Field, render adapter, URL detection or propagation suppression. -->
<main data-hydrated={hydrated}>
  <form
    id="remote-form"
    {...saveFieldForm}
    novalidate
    onsubmit={(event) => {
      if (canceled) event.preventDefault();
      else nativeSubmit++;
    }}
    onreset={() => {
      resets++;
    }}
  >
    <input
      id="remote-email"
      {...saveFieldForm.fields.email.as('email', 'seed@example.com')}
      required
    />
    <button type="submit">Submit</button><button type="reset">Reset</button>
  </form>
  <button
    onclick={() => {
      canceled = !canceled;
    }}>Toggle cancellation</button
  >
  <button onclick={refreshCounter}>Read server counter</button>
  <output id="remote-result">{JSON.stringify(saveFieldForm.result ?? null)}</output>
  <output id="remote-resets">{resets}</output><output id="remote-native-submit"
    >{nativeSubmit}</output
  >
  <output id="server-counter">{observedEffects ?? ''}</output><output id="counter-reads"
    >{counterReads}</output
  >
</main>
