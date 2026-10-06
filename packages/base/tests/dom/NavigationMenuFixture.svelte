<script lang="ts">
  import { untrack } from 'svelte';
  import { NavigationMenu } from '../../src/lib/navigation-menu/index.js';
  import type {
    NavigationMenuRootActions,
    NavigationMenuRootChangeEventDetails,
  } from '../../src/lib/navigation-menu/types.js';

  let { scenario = 'default' }: { scenario?: string } = $props();
  let ownerValue = $state<string | number | boolean | null | undefined>(
    untrack(() => (scenario === 'controlled' ? null : undefined)),
  );
  let actions = $state<NavigationMenuRootActions | null>(null);
  const events: { value: unknown; reason: string; canceled: boolean }[] = [];
  const completions: boolean[] = [];
  let showFirst = $state(true);
  let showRoot = $state(true);
  let contentText = $state('First content');
  const keepMounted = $derived(scenario === 'keep');
  const firstValue = $derived(
    scenario === 'zero' ? 0 : scenario === 'false' ? false : scenario === 'empty' ? '' : 'first',
  );
  const defaultValue = $derived(scenario === 'open' || scenario === 'manual' ? 'first' : null);

  function onValueChange(value: unknown, details: NavigationMenuRootChangeEventDetails) {
    if (scenario === 'cancel') details.cancel();
    events.push({ value, reason: details.reason, canceled: details.isCanceled });
  }

  export function snapshot() {
    return { events, completions, actions };
  }
  export function setValue(value: string | number | boolean | null | undefined) {
    ownerValue = value;
  }
  export function removeFirst() {
    showFirst = false;
  }
  export function removeRoot() {
    showRoot = false;
  }
  export function setContent(text: string) {
    contentText = text;
  }
</script>

{#snippet menu()}
  <NavigationMenu.List id="tested-list">
    {#if showFirst}
      <NavigationMenu.Item value={firstValue} id="tested-item">
        <NavigationMenu.Trigger id="first-trigger" disabled={scenario === 'disabled'}>
          First <NavigationMenu.Icon id="tested-icon" />
        </NavigationMenu.Trigger>
        <NavigationMenu.Content id="first-content" {keepMounted}>
          <NavigationMenu.Link
            id="first-link"
            href="#first"
            active
            closeOnClick={scenario === 'link-close'}>{contentText}</NavigationMenu.Link
          >
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    {/if}
    <NavigationMenu.Item value="second">
      <NavigationMenu.Trigger id="second-trigger">Second</NavigationMenu.Trigger>
      <NavigationMenu.Content id="second-content" {keepMounted}>
        <NavigationMenu.Link id="second-link" href="#second">Second content</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Portal {keepMounted}>
    <NavigationMenu.Backdrop id="tested-backdrop" />
    <NavigationMenu.Positioner id="tested-positioner">
      <NavigationMenu.Popup id="tested-popup">
        <NavigationMenu.Arrow id="tested-arrow" />
        <NavigationMenu.Viewport id="tested-viewport" />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
{/snippet}

<button id="before">Before</button>
{#if showRoot}
  {#if scenario === 'manual'}
    <NavigationMenu.Root
      id="tested-root"
      {defaultValue}
      bind:actions
      {onValueChange}
      onOpenChangeComplete={(open) => completions.push(open)}
      children={menu}
    />
  {:else}
    <NavigationMenu.Root
      id="tested-root"
      {defaultValue}
      value={ownerValue}
      {onValueChange}
      onOpenChangeComplete={(open) => completions.push(open)}
      children={menu}
    />
  {/if}
{/if}
<button id="after">After</button>
