<script lang="ts">
  import { onMount } from 'svelte';
  import { Input } from '@sveltery/base/input';
  import { saveChoice } from './input.remote.js';
  let { data } = $props(); let hydrated = $state(false);
  let events = $state<{ checked: boolean; type: string; trusted: boolean }[]>([]);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <form {...saveChoice} onreset={event => { if (data.canceledReset) event.preventDefault(); }}>
    {#if data.native}
      <input {...saveChoice.fields.enabled.as('checkbox', true)} data-testid="checkbox" oninput={event => events.push({ checked: event.currentTarget.checked, type: event.type, trusted: event.isTrusted })} />
      <input {...saveChoice.fields.choice.as('radio', 'first')} data-testid="first" />
      <input {...saveChoice.fields.choice.as('radio', 'second')} data-testid="second" />
    {:else}
      <Input {...saveChoice.fields.enabled.as('checkbox', true)} data-testid="checkbox" onValueChange={(_value, details) => events.push({ checked: (details.event.target as HTMLInputElement).checked, type: details.event.type, trusted: details.event.isTrusted })} />
      <Input {...saveChoice.fields.choice.as('radio', 'first')} data-testid="first" />
      <Input {...saveChoice.fields.choice.as('radio', 'second')} data-testid="second" />
    {/if}
    <button type="reset">Reset</button><button type="submit">Submit</button>
  </form>
  <button onclick={() => { saveChoice.fields.enabled.set(false); saveChoice.fields.choice.set('first'); }}>Programmatic</button>
  <output data-testid="owner">{JSON.stringify({ enabled: saveChoice.fields.enabled.value(), choice: saveChoice.fields.choice.value() })}</output>
  <output data-testid="result">{JSON.stringify(saveChoice.result ?? null)}</output>
  <output data-testid="events">{JSON.stringify(events)}</output>
</main>
