<script lang="ts">
  // Independent standalone checked characterization; no ordinary upstream Input credit.
  import { onMount, untrack } from 'svelte';
  import { Input } from '@sveltery/base/input';
  import { mergeProps } from '@sveltery/base/merge-props';
  import type { InputChangeEventDetails } from '@sveltery/base/input';
  let { scenario = 'checkbox-reject-off' }: { scenario?: string } = $props();
  const radio = $derived(scenario.startsWith('radio'));
  const controlled = $derived(!scenario.startsWith('checkbox-uncontrolled') && !scenario.startsWith('radio-uncontrolled'));
  let checked = $state(untrack(() => scenario.endsWith('-on')));
  let first = $state(true);
  let seed = $state(untrack(() => !scenario.includes('default-off')));
  let alternate = $state(false);
  let hydrated = $state(false);
  let calls = $state<{ value: string; checked: boolean; reason: string; type: string; canceled: boolean; defaultPrevented: boolean; trusted: boolean }[]>([]);
  let order = $state<string[]>([]);
  onMount(() => { hydrated = true; });
  function append(item: string) { if (!scenario.includes('reassociate')) order.push(item); }
  function changed(value: string, details: InputChangeEventDetails) {
    append('value');
    const next = (details.event.target as HTMLInputElement).checked;
    if (scenario.includes('cancel-change')) details.cancel();
    if (scenario.includes('accept')) { checked = next; if (radio) first = !next; }
    if (scenario.includes('rewrite')) { checked = !next; if (radio) first = next; }
    if (!scenario.includes('reassociate')) calls.push({ value, checked: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented, trusted: details.event.isTrusted });
  }
</script>
<main data-hydrated={hydrated}>
  <svelte:element this={scenario.includes('no-form') ? 'div' : 'form'} data-testid="form" onreset={(event: Event) => { if (scenario.includes('cancel-reset')) event.preventDefault(); }}>
    {#if radio}<div><Input type="radio" name="choice" value="first" {...(scenario.includes('first-uncontrolled') ? { defaultChecked: true } : { checked: first })} data-testid="first" /></div>{/if}
    <Input type={radio ? 'radio' : 'checkbox'} name={radio ? 'choice' : 'check'} {...(scenario.includes('no-value') ? {} : { value: 'token' })} data-testid="input"
      {...(controlled ? { checked } : {})}
      {...(scenario.includes('default') ? { defaultChecked: seed } : {})}
      onclick={event => { append('consumer'); if (scenario.includes('prevent-base')) event.preventBaseUIHandler(); if (scenario.includes('prevent-default') || scenario.includes('cancel-click')) event.preventDefault(); if (scenario.includes('reset-in-input')) event.currentTarget.form?.reset(); if (scenario.includes('reassociate')) event.currentTarget.setAttribute('form', 'other-form'); }}
      onValueChange={changed}>
      {#snippet render(props)}
        {const rendered = $derived(scenario.includes('after-props-read') ? { ...props, onclick(event: MouseEvent) { append('render'); (props.onclick as ((event: MouseEvent) => void) | undefined)?.(event); checked = (event.currentTarget as HTMLInputElement).checked; first = !checked; append('after'); } } : mergeProps(props, { onclick: () => append('render') }))}
        {#if alternate}<input {...rendered} data-host="replacement" />
        {:else}<input {...rendered} data-host="initial" />{/if}
      {/snippet}
    </Input>
    <button type="reset">Reset</button>
  </svelte:element>
  <form id="other-form" data-testid="other-form"><Input type="radio" name="choice" value="other" checked data-testid="other" /></form>
  <button onclick={() => { checked = !checked; if (radio) first = !checked; }}>Programmatic</button>
  <button onclick={() => { seed = !seed; }}>Defaults</button>
  <button onclick={() => { alternate = !alternate; }}>Replace</button>
  <output data-testid="owner">{JSON.stringify({ checked, first })}</output>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="order">{JSON.stringify(order)}</output>
</main>
