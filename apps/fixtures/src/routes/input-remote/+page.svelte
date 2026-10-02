<script lang="ts">
  import { onMount } from 'svelte';
  import { Input } from '@sveltery/base/input';
  import { saveInput } from './input.remote.js';
  let { data } = $props(); let hydrated = $state(false);
  let events = $state<{ channel: string; value: string; remote: string | undefined; canceled?: boolean; reason?: string; type?: string }[]>([]);
  let resets = $state(0); let invalid = $state(0);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <form {...saveInput} onreset={event => { resets++; if (data.canceledReset) event.preventDefault(); }}>
    <label for="remote-email">Email</label>
    {#if data.native}
      <input id="remote-email" {...saveInput.fields.email.as('email', 'seed@example.com')} required
        oninvalid={() => { invalid++; }} oninput={event => events.push({ channel: 'native', value: event.currentTarget.value, remote: saveInput.fields.email.value() })} />
    {:else}
      <Input id="remote-email" {...saveInput.fields.email.as('email', 'seed@example.com')} required
        oninvalid={() => { invalid++; }}
        oninput={event => events.push({ channel: 'consumer', value: event.currentTarget.value, remote: saveInput.fields.email.value() })}
        onValueChange={(value, details) => { if (data.canceledValue) details.cancel(); events.push({ channel: 'value', value, remote: saveInput.fields.email.value(), canceled: details.isCanceled, reason: details.reason, type: details.event.type }); }} />
    {/if}
    <button type="submit">Submit</button><button type="reset">Reset</button>
  </form>
  <button onclick={() => saveInput.fields.email.set('programmatic@example.com')}>Programmatic</button>
  <button onclick={() => saveInput.validate({ includeUntouched: true })}>Validate</button>
  <output data-testid="remote-value">{saveInput.fields.email.value() ?? ''}</output>
  <output data-testid="issues">{JSON.stringify(saveInput.fields.email.issues() ?? [])}</output>
  <output data-testid="result">{JSON.stringify(saveInput.result ?? null)}</output>
  <output data-testid="events">{JSON.stringify(events)}</output><output data-testid="resets">{resets}</output><output data-testid="invalid">{invalid}</output>
</main>
