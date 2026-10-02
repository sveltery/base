<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { Input } from '@sveltery/base/input';
  import { saveInput } from './input.remote.js';
  let { data } = $props(); let hydrated = $state(false);
  let events = $state<{ channel: string; value: string; remote: string | undefined; canceled?: boolean; reason?: string; type?: string }[]>([]);
  let resets = $state(0); let invalid = $state(0);
  let phases = $state<{ phase: string; trusted: boolean; eventPhase: number; name: string; value: string; defaultValue: string; formData: string | null; remote: string | undefined; getter: string; sameForm: boolean }[]>([]);
  const formAttachmentKey = createAttachmentKey(); const targetAttachmentKey = createAttachmentKey();
  function observe(phase: string, event: Event) {
    const input = event.target as HTMLInputElement; if (input.id !== 'remote-email') return;
    untrack(() => phases.push({ phase, trusted: event.isTrusted, eventPhase: event.eventPhase, name: input.name, value: input.value, defaultValue: input.defaultValue,
      formData: input.form ? new FormData(input.form).get('email') as string | null : null, remote: saveInput.fields.email.value(), getter: String(saveInput.fields.email.as('email', 'seed@example.com').value),
      sameForm: input.form === saveInput.element }));
  }
  function observeForm(node: HTMLFormElement) {
    const capture = (event: Event) => observe('form:capture', event); const bubble = (event: Event) => observe('form:bubble-after-Kit', event);
    node.addEventListener('input', capture, true); node.addEventListener('input', bubble);
    return () => { node.removeEventListener('input', capture, true); node.removeEventListener('input', bubble); };
  }
  function observeTarget(node: HTMLInputElement) {
    let connected = true;
    const listener = (event: Event) => { observe('target:bubble', event); void tick().then(() => { if (connected) observe('target:after-tick', event); }); };
    node.addEventListener('input', listener); return () => { connected = false; node.removeEventListener('input', listener); };
  }
  onMount(() => { hydrated = true; });
</script>
{#snippet replacement(props: Record<string | symbol, unknown>)}<input {...props as HTMLInputAttributes} />{/snippet}
<main data-hydrated={hydrated}>
  <form {...saveInput} {...{ [formAttachmentKey]: observeForm }} onreset={event => { resets++; if (data.canceledReset) event.preventDefault(); }}>
    <label for="remote-email">Email</label>
    {#if data.native}
      <input id="remote-email" {...saveInput.fields.email.as('email', 'seed@example.com')} {...{ [targetAttachmentKey]: observeTarget }} required
        oninvalid={() => { invalid++; }} oninput={event => { observe('delegated:native', event); events.push({ channel: 'native', value: event.currentTarget.value, remote: saveInput.fields.email.value() }); }} />
    {:else}
      <Input id="remote-email" {...saveInput.fields.email.as('email', 'seed@example.com')} {...{ [targetAttachmentKey]: observeTarget }} render={data.replacement ? replacement : undefined} required
        oninvalid={() => { invalid++; }}
        oninput={event => { observe('delegated:consumer', event); events.push({ channel: 'consumer', value: event.currentTarget.value, remote: saveInput.fields.email.value() }); }}
        onValueChange={(value, details) => { observe('delegated:value', details.event); if (data.canceledValue) details.cancel(); events.push({ channel: 'value', value, remote: saveInput.fields.email.value(), canceled: details.isCanceled, reason: details.reason, type: details.event.type }); }} />
    {/if}
    <button type="submit">Submit</button><button type="reset">Reset</button>
  </form>
  <button onclick={() => saveInput.fields.email.set('programmatic@example.com')}>Programmatic</button>
  <button onclick={() => saveInput.validate({ includeUntouched: true })}>Validate</button>
  <output data-testid="remote-value">{saveInput.fields.email.value() ?? ''}</output>
  <output data-testid="issues">{JSON.stringify(saveInput.fields.email.issues() ?? [])}</output>
  <output data-testid="result">{JSON.stringify(saveInput.result ?? null)}</output>
  <output data-testid="events">{JSON.stringify(events)}</output><output data-testid="resets">{resets}</output><output data-testid="invalid">{invalid}</output>
  <output data-testid="phases">{JSON.stringify(phases)}</output>
</main>
