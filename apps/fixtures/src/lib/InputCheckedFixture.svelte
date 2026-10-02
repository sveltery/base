<script lang="ts">
  // Independent standalone checked characterization; no ordinary upstream Input credit.
  import { onMount, untrack } from 'svelte';
  import { Input } from '@sveltery/base/input';
  import { mergeProps } from '@sveltery/base/merge-props';
  import type { InputChangeEventDetails } from '@sveltery/base/input';
  let { scenario = 'checkbox-reject-off' }: { scenario?: string } = $props();
  const radio = $derived(scenario.startsWith('radio'));
  const controlled = $derived(!scenario.includes('uncontrolled'));
  let checked = $state(untrack(() => scenario.endsWith('-on')));
  let first = $state(true);
  let hydrated = $state(false);
  let calls = $state<{ value: string; checked: boolean; reason: string; type: string; canceled: boolean; defaultPrevented: boolean; trusted: boolean }[]>([]);
  let order = $state<string[]>([]);
  onMount(() => { hydrated = true; });
  function changed(value: string, details: InputChangeEventDetails) {
    order.push('value');
    const next = (details.event.target as HTMLInputElement).checked;
    if (scenario.includes('cancel-change')) details.cancel();
    if (scenario.includes('accept')) { checked = next; if (radio) first = !next; }
    if (scenario.includes('rewrite')) { checked = !next; if (radio) first = next; }
    calls.push({ value, checked: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented, trusted: details.event.isTrusted });
  }
</script>
<main data-hydrated={hydrated}>
  <form data-testid="form" onreset={event => { if (scenario.includes('cancel-reset')) event.preventDefault(); }}>
    {#if radio}<Input type="radio" name="choice" value="first" checked={first} data-testid="first" />{/if}
    <Input type={radio ? 'radio' : 'checkbox'} name={radio ? 'choice' : 'check'} value="token" data-testid="input"
      {...(controlled ? { checked } : {})}
      {...(scenario.includes('default') ? { defaultChecked: !scenario.includes('default-off') } : {})}
      oninput={event => { order.push('consumer'); if (scenario.includes('prevent-base')) event.preventBaseUIHandler(); if (scenario.includes('prevent-default')) event.preventDefault(); if (scenario.includes('reset-in-input')) event.currentTarget.form?.reset(); }}
      onValueChange={changed}>
      {#snippet render(props)}<input {...mergeProps(props, { oninput: () => order.push('render') })} />{/snippet}
    </Input>
    <button type="reset">Reset</button>
  </form>
  <form data-testid="other-form"><Input type="radio" name="choice" value="other" checked data-testid="other" /></form>
  <button onclick={() => { checked = !checked; if (radio) first = !checked; }}>Programmatic</button>
  <output data-testid="owner">{JSON.stringify({ checked, first })}</output>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="order">{JSON.stringify(order)}</output>
</main>
