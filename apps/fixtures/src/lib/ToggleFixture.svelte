<script lang="ts">
  // Pinned Toggle assertions: parity/toggle/upstream-inventory.json. MIT: UPSTREAM_LICENSE.
  import { onMount, untrack, type Snippet } from 'svelte';
  import Toggle from '../../../../packages/base/src/lib/toggle/Toggle.svelte';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import type { ToggleState, ToggleChangeEventDetails } from '../../../../packages/base/src/lib/toggle/types.js';
  let { scenario = 'uncontrolled' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let ownerPressed = $state<boolean | undefined>(untrack(() => scenario.startsWith('controlled') || scenario === 'accept' ? false : undefined));
  let defaultPressed = $state(untrack(() => scenario === 'default-true' || scenario === 'controlled-fallback'));
  let disabled = $state(untrack(() => scenario === 'disabled' || scenario === 'custom-disabled'));
  let shown = $state(true);
  let ref = $state<HTMLElement | null | undefined>();
  let calls = $state<{ pressed: boolean; reason: string; type: string; before: string | null; canceled: boolean; defaultPrevented: boolean; trigger: boolean }[]>([]);
  let order = $state<string[]>([]);
  let submitted = $state(0), reset = $state(0), attached = $state(0), detached = $state(0);
  const custom = $derived(['custom', 'custom-disabled', 'attachment', 'render-cancel', 'render-order', 'descendant', 'link'].includes(scenario));
  function changed(next: boolean, details: ToggleChangeEventDetails) {
    if (scenario === 'cancel') details.cancel();
    order = [...order, 'change'];
    calls = [...calls, { pressed: next, reason: details.reason, type: details.event.type,
      before: document.getElementById('tested-toggle')!.getAttribute('aria-pressed'), canceled: details.isCanceled,
      defaultPrevented: details.event.defaultPrevented, trigger: details.trigger !== undefined }];
    if (scenario === 'accept') ownerPressed = next;
  }
  function attachedHost(node: HTMLElement) {
    untrack(() => attached++); node.dataset.consumerAttached = '';
    return () => untrack(() => detached++);
  }
  export function snapshot() { return { ref, attached, detached }; }
  onMount(() => { hydrated = true; });
</script>
{#snippet replacement(props: Record<string | symbol, unknown>, state: ToggleState, children: Snippet | undefined)}
  {#if scenario === 'link'}
    <a {...props} href="#target">{@render children?.()}</a>
  {:else}
    <span {...mergeProps(props, { onclick: (event: MouseEvent & { preventBaseUIHandler(): void }) => {
      order = [...order, 'render']; if (scenario === 'render-cancel') event.preventBaseUIHandler();
    } })} data-state-pressed={state.pressed} data-state-disabled={state.disabled}>
      {@render children?.()}
      {#if scenario === 'descendant'}<input aria-label="Inner input" />{/if}
    </span>
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <input type="checkbox" aria-label="Owner pressed" checked={ownerPressed ?? false} onchange={() => ownerPressed = !ownerPressed} />
  <button onclick={() => ownerPressed = undefined}>Clear controlled prop</button>
  <button onclick={() => defaultPressed = !defaultPressed}>Change default</button>
  <button onclick={() => disabled = !disabled}>Change disabled</button>
  <button onclick={() => shown = !shown}>Toggle mounting</button>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div onclick={() => order = [...order, 'ancestor']}>
    <form id="toggle-form" onsubmit={event => { event.preventDefault(); submitted++; }} onreset={() => reset++}>
      <input aria-label="Reset field" value="initial" />
      {#if shown}
        <Toggle id="tested-toggle" pressed={ownerPressed} {defaultPressed} {disabled} nativeButton={!custom && !scenario.startsWith('non-native')}
          render={custom ? replacement : undefined} bind:ref
          {...scenario === 'stripped-form' || scenario === 'non-native-stripped' ? { form: 'external-form', type: 'submit', value: 'sent', name: 'toggle' } : scenario === 'stripped-reset' ? { type: 'reset' } : {}}
          {@attach scenario === 'attachment' ? attachedHost : () => {}}
          class={state => state.pressed ? 'pressed-class' : 'unpressed-class'} style={state => `opacity:${state.disabled ? 0.5 : 1}`}
          onPressedChange={changed} onclick={event => {
            order = [...order, 'consumer']; if (scenario === 'click-cancel') event.preventBaseUIHandler();
            if (scenario === 'click-default') event.preventDefault();
          }}>Toggle</Toggle>
      {/if}
      <button type="reset">Native reset</button>
    </form>
  </div>
  <form id="external-form"></form>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="order">{JSON.stringify(order)}</output>
  <output data-testid="forms">{JSON.stringify({ submitted, reset })}</output>
  <output data-testid="ref">{ref?.id ?? ''}</output>
  <output data-testid="attachments">{JSON.stringify({ attached, detached })}</output>
  <div id="target">Link target</div>
</main>
