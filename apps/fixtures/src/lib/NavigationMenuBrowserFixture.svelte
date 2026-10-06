<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { NavigationMenu } from '@sveltery/base/navigation-menu';
  import { DirectionProvider } from '@sveltery/base/direction-provider';
  import type {
    NavigationMenuRootActions,
    NavigationMenuRootChangeEventDetails,
  } from '@sveltery/base/navigation-menu';
  let {
    scenario = 'default',
    direction = 'ltr',
    orientation = 'horizontal',
  }: {
    scenario?: string;
    direction?: 'ltr' | 'rtl';
    orientation?: 'horizontal' | 'vertical';
  } = $props();
  let ownerValue = $state<unknown>(
    untrack(() => (scenario === 'controlled' ? null : scenario === 'manual' ? 'first' : undefined)),
  );
  let actions = $state<NavigationMenuRootActions | null>(null);
  let shown = $state(true);
  let firstShown = $state(true);
  let dynamicText = $state('First content');
  const calls: { value: unknown; reason: string; type: string; canceled: boolean }[] = [];
  const completions: boolean[] = [];
  const keep = $derived(
    scenario === 'keep' || scenario === 'ssr-keep' || scenario === 'content-keep',
  );
  const keepPortal = $derived(scenario === 'keep');
  const initial = $derived(
    scenario === 'open' || scenario === 'manual' || scenario === 'nested' ? 'first' : null,
  );
  const firstValue = $derived(
    scenario === 'zero' ? 0 : scenario === 'false' ? false : scenario === 'empty' ? '' : 'first',
  );
  function change(value: unknown, details: NavigationMenuRootChangeEventDetails) {
    if (scenario === 'cancel') details.cancel();
    calls.push({
      value,
      reason: details.reason,
      type: details.event.type,
      canceled: details.isCanceled,
    });
  }
  onMount(() => {
    const api = {
      snapshot: () => ({ calls, completions }),
      setValue(value: unknown) {
        ownerValue = value;
      },
      removeFirst() {
        firstShown = false;
      },
      removeRoot() {
        shown = false;
      },
      setContent(text: string) {
        dynamicText = text;
      },
      unmount() {
        actions?.unmount();
      },
    };
    Object.assign(window, { navigationMenuFixture: api });
    return () => {
      delete (window as unknown as { navigationMenuFixture?: unknown }).navigationMenuFixture;
    };
  });
</script>

{#snippet nestedMenu()}
  <NavigationMenu.Root defaultValue="sub-first" id="nested-root">
    <NavigationMenu.List id="nested-list">
      <NavigationMenu.Item value="sub-first"
        ><NavigationMenu.Trigger id="sub-first-trigger">Sub first</NavigationMenu.Trigger
        ><NavigationMenu.Content keepMounted id="sub-first-content"
          ><NavigationMenu.Link id="sub-first-link" href="#nested" closeOnClick
            >Sub first link</NavigationMenu.Link
          ></NavigationMenu.Content
        ></NavigationMenu.Item
      >
      <NavigationMenu.Item value="sub-second"
        ><NavigationMenu.Trigger id="sub-second-trigger">Sub second</NavigationMenu.Trigger
        ><NavigationMenu.Content keepMounted id="sub-second-content"
          ><NavigationMenu.Link id="sub-second-link" href="#nested" closeOnClick
            >Sub second link</NavigationMenu.Link
          ></NavigationMenu.Content
        ></NavigationMenu.Item
      >
    </NavigationMenu.List>
    <NavigationMenu.Viewport id="nested-viewport" />
  </NavigationMenu.Root>
{/snippet}
{#snippet menu()}
  <NavigationMenu.List id="tested-list">
    {#if firstShown}
      <NavigationMenu.Item value={firstValue} id="tested-item">
        <NavigationMenu.Trigger id="first-trigger" disabled={scenario === 'disabled'}
          >First <NavigationMenu.Icon id="tested-icon" /></NavigationMenu.Trigger
        >
        <NavigationMenu.Content id="first-content" keepMounted={keep}>
          <NavigationMenu.Link
            id="first-link"
            href="#first"
            active
            closeOnClick={scenario === 'link-close'}>{dynamicText}</NavigationMenu.Link
          >
          <NavigationMenu.Link id="last-link" href="#last">Last link</NavigationMenu.Link>
          {#if scenario === 'nested'}{@render nestedMenu()}{/if}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    {/if}
    <NavigationMenu.Item value="second"
      ><NavigationMenu.Trigger id="second-trigger">Second</NavigationMenu.Trigger
      ><NavigationMenu.Content id="second-content" keepMounted={keep}
        ><NavigationMenu.Link id="second-link" href="#second">Second content</NavigationMenu.Link
        ></NavigationMenu.Content
      ></NavigationMenu.Item
    >
  </NavigationMenu.List>
  <NavigationMenu.Portal keepMounted={keepPortal}>
    <NavigationMenu.Backdrop id="tested-backdrop" />
    <NavigationMenu.Positioner
      id="tested-positioner"
      side={scenario === 'origin-left' ? 'left' : 'bottom'}
    >
      <NavigationMenu.Popup id="tested-popup"
        ><NavigationMenu.Arrow id="tested-arrow" /><NavigationMenu.Viewport
          id="tested-viewport"
        /></NavigationMenu.Popup
      >
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
{/snippet}

<main data-hydrated="true">
  <DirectionProvider {direction}>
    <button id="before">Before</button>
    {#if shown}
      {#if scenario === 'manual'}
        <NavigationMenu.Root
          id="tested-root"
          {orientation}
          defaultValue={initial}
          value={ownerValue}
          bind:actions
          onValueChange={change}
          onOpenChangeComplete={(open) => completions.push(open)}
          children={menu}
        />
      {:else}
        <NavigationMenu.Root
          id="tested-root"
          {orientation}
          defaultValue={initial}
          value={ownerValue}
          onValueChange={change}
          onOpenChangeComplete={(open) => completions.push(open)}
          children={menu}
        />
      {/if}
    {/if}
    <button id="after">After</button>
  </DirectionProvider>
</main>

<style>
  :global(#tested-list),
  :global(#nested-list) {
    display: flex;
    gap: 12px;
    margin: 60px 40px;
    padding: 0;
    list-style: none;
  }
  :global(#tested-root) {
    width: max-content;
  }
  :global(#tested-positioner) {
    width: var(--positioner-width);
    height: var(--positioner-height);
    z-index: 10;
  }
  :global(#tested-popup) {
    box-sizing: border-box;
    width: var(--popup-width);
    height: var(--popup-height);
    padding: 16px;
    background: white;
    border: 1px solid black;
  }
  :global(#first-content),
  :global(#second-content) {
    width: 260px;
  }
  :global(#first-link),
  :global(#last-link),
  :global(#second-link),
  :global(#sub-first-link),
  :global(#sub-second-link) {
    display: block;
    padding: 8px;
  }
</style>
