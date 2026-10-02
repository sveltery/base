<script lang="ts">
  // Paired standalone Input scenarios. MIT source attribution: parity/input/UPSTREAM_LICENSE.
  import { createAttachmentKey } from 'svelte/attachments';
  import { onMount, untrack } from 'svelte';
  import { Input } from '@sveltery/base/input';
  import { mergeProps } from '@sveltery/base/merge-props';
  import type { InputChangeEventDetails, InputState } from '@sveltery/base/input';
  let { scenario = 'default' }: { scenario?: string } = $props();
  let value = $state('owner'); let disabled = $state(untrack(() => scenario === 'disabled'));
  let id = $state<string | undefined>(untrack(() => scenario === 'generated' ? undefined : 'tested-input'));
  let name = $state('field'); let seed = $state('seed'); let alternate = $state(false);
  let ref = $state<HTMLElement | null>(); let attached = $state(0); let detached = $state(0);
  let calls = $state<{ value: string; reason: string; type: string; canceled: boolean; defaultPrevented: boolean }[]>([]);
  let order = $state<string[]>([]);
  let hydrated = $state(false); onMount(() => { hydrated = true; });
  const controlled = $derived(scenario.startsWith('controlled'));
  const attachmentKey = createAttachmentKey();
  function attachment(node: HTMLElement) { untrack(() => { attached++; }); node.dataset.consumerAttached = ''; return () => { untrack(() => { detached++; }); }; }
  function changed(next: string, details: InputChangeEventDetails) {
    order.push('value'); if (scenario === 'cancel' || scenario === 'controlled-cancel') details.cancel();
    if (scenario.startsWith('controlled') && scenario.endsWith('accept')) value = next;
    if (scenario.startsWith('controlled') && scenario.endsWith('rewrite')) value = next.toUpperCase();
    calls.push({ value: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented });
  }
  export function snapshot() { return { ref, attached, detached, calls, order }; }
</script>
{#snippet replacement(props: Record<string | symbol, unknown>, state: InputState)}
  {const merged = $derived(mergeProps(props, scenario === 'render-order' ? { oninput: () => order.push('render') } : {}))}
  {#if alternate}<textarea {...merged} data-state={JSON.stringify(state)} data-testid="input"></textarea>
  {:else}<input {...merged} data-state={JSON.stringify(state)} data-testid="input" />{/if}
{/snippet}
<main data-hydrated={hydrated}>
  <form data-testid="form" onreset={event => { if (scenario === 'reset-cancel' || scenario.endsWith('reset-in-input-cancel')) event.preventDefault(); }}>
    <Input {id} {name} {disabled} required={scenario === 'required'} type={scenario === 'email' ? 'email' : 'text'}
      {...(controlled ? { value, ...(scenario.includes('default') ? { defaultValue: seed } : {}) } : { defaultValue: seed })}
      {...(scenario === 'attachment' ? { [attachmentKey]: attachment } : {})}
      oninput={event => { order.push('consumer'); if (scenario.endsWith('prevent-base')) event.preventBaseUIHandler(); if (scenario.endsWith('prevent-default')) event.preventDefault(); if (scenario.includes('reset-in-input')) (event.currentTarget as HTMLInputElement).form?.reset(); }}
      onValueChange={changed} class={state => state.disabled ? 'disabled-class' : 'enabled-class'}
      style={state => `opacity:${state.disabled ? 0.5 : 1}`} render={replacement} bind:ref />
    <button type="reset">Reset</button>
  </form>
  {#if scenario === 'generated'}<Input data-testid="input-second" /><Input data-testid="input-third" />{/if}
  <button onclick={() => { value = 'programmatic'; }}>Programmatic</button>
  <button onclick={() => { disabled = !disabled; id = id ? undefined : 'new-id'; name = 'renamed'; seed = 'new-seed'; }}>Props</button>
  <button onclick={() => { alternate = !alternate; }}>Replace</button>
  <output data-testid="value">{value}</output><output data-testid="calls">{JSON.stringify(calls)}</output><output data-testid="order">{JSON.stringify(order)}</output>
  <output data-testid="ref">{ref?.tagName ?? 'none'}</output><output data-testid="attachment">{attached}/{detached}</output>
</main>
