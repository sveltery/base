<script lang="ts">
  // Source-derived scenarios and authored native probes, tracked separately in the audit.
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Toolbar, Toggle, ToggleGroup, DirectionProvider } from '@sveltery/base';
  import type { ToggleChangeEventDetails } from '@sveltery/base/toggle';
  import type { HTMLAttributes } from 'svelte/elements';
  import { navigationCase, type NavigationCall } from './navigation-cases.js';
  let {
    scenario = 'group-single',
    direction = 'ltr',
    orientation = 'horizontal',
  }: {
    scenario?: string;
    direction?: 'ltr' | 'rtl';
    orientation?: 'horizontal' | 'vertical';
  } = $props();
  const config = $derived(navigationCase(scenario));
  let hydrated = $state(false);
  let owner = $state<string[] | undefined>(
    untrack(() => (config.controlled ? ['two'] : undefined)),
  );
  let multiple = $state(untrack(() => config.multiple));
  let itemDisabled = $state(untrack(() => config.disabled));
  let inputDisabled = $state(untrack(() => config.inputDisabled));
  let focusable = $state(untrack(() => !config.nonFocusable));
  let shown = $state(true);
  let items = $state(['one', 'two', 'three']);
  let calls = $state<NavigationCall[]>([]);
  let detailsIdentity: ToggleChangeEventDetails | undefined;
  let ref = $state<HTMLElement | null | undefined>();
  let attached = $state(0),
    detached = $state(0),
    clicks = $state(0),
    hover = $state(0),
    keydowns = $state(0),
    resets = $state(0);
  function ownChange(next: boolean, details: ToggleChangeEventDetails) {
    detailsIdentity = details;
    if (config.ownCancel) details.cancel();
    calls = [
      ...calls,
      {
        part: 'toggle',
        value: next,
        same: true,
        reason: details.reason,
        type: details.event.type,
        canceled: details.isCanceled,
        defaultPrevented: details.event.defaultPrevented,
        before: document.getElementById('one')?.getAttribute('aria-pressed') ?? null,
      },
    ];
  }
  function groupChange(next: string[], details: ToggleChangeEventDetails) {
    if (config.groupCancel) details.cancel();
    calls = [
      ...calls,
      {
        part: 'group',
        value: next,
        same: details === detailsIdentity,
        reason: details.reason,
        type: details.event.type,
        canceled: details.isCanceled,
        defaultPrevented: details.event.defaultPrevented,
        before: document.getElementById('one')?.getAttribute('aria-pressed') ?? null,
      },
    ];
    if (config.accept) owner = next;
  }
  function attachHost(node: HTMLElement) {
    untrack(() => attached++);
    node.dataset.authoredAttachment = '';
    return () => untrack(() => detached++);
  }
  onMount(() => {
    hydrated = true;
  });
  export function snapshot() {
    return { ref, attached, detached };
  }
</script>

{#snippet customButton(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}
  <span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>
{/snippet}
{#snippet renderToggle(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}
  <Toggle {...props} onPressedChange={ownChange}>{@render children?.()}</Toggle>
{/snippet}
{#snippet toggleChildren()}
  {#each items as value (value)}
    {#if config.wrapped}
      <Toolbar.Button id={value} {value} disabled={itemDisabled} render={renderToggle}
        >{value}</Toolbar.Button
      >
    {:else}
      <Toggle
        id={value}
        value={config.missingValues ? (value === 'one' ? undefined : '') : value}
        disabled={value === 'two' && itemDisabled}
        onPressedChange={ownChange}
        onclick={(event) => {
          if (config.consumerPrevent) event.preventBaseUIHandler();
          if (config.consumerDefault) event.preventDefault();
        }}
        bind:ref
        {@attach attachHost}
        class={(state) => ['toggle', { pressed: state.pressed }]}
        style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}>{value}</Toggle
      >
    {/if}
  {/each}
{/snippet}
{#snippet selectionGroup()}
  <ToggleGroup
    id="selection-group"
    disabled={config.groupRootDisabled}
    {multiple}
    value={owner}
    defaultValue={config.initialized ? ['one'] : config.defaultValue}
    onValueChange={groupChange}
    {orientation}
    loopFocus={config.loopFocus}
  >
    {@render toggleChildren()}
  </ToggleGroup>
{/snippet}
{#snippet toolbarChildren()}
  {#if config.grouped}
    <Toolbar.Button id="before">Before</Toolbar.Button>
    <Toolbar.Group disabled={config.groupDisabled}>
      {@render selectionGroup()}
    </Toolbar.Group>
    <Toolbar.Button id="after">After</Toolbar.Button>
  {:else if config.input}
    <Toolbar.Button id="before">Before</Toolbar.Button>
    <Toolbar.Input
      id="tested-input"
      type={config.checkbox ? 'checkbox' : 'text'}
      defaultValue={config.checkbox ? undefined : 'abcd'}
      disabled={inputDisabled}
      focusableWhenDisabled={focusable}
      bind:ref
      {@attach attachHost}
    />
    <Toolbar.Button id="after">After</Toolbar.Button>
  {:else if config.nestedGroups}
    <Toolbar.Group id="outer" disabled>
      <Toolbar.Button id="outer-button">Outer</Toolbar.Button>
      <Toolbar.Group id="inner"
        ><Toolbar.Button id="inner-button">Inner</Toolbar.Button></Toolbar.Group
      >
    </Toolbar.Group>
  {:else}
    <Toolbar.Button
      id="one"
      disabled={scenario === 'toolbar-metadata' && itemDisabled}
      focusableWhenDisabled={focusable}>One</Toolbar.Button
    >
    <Toolbar.Link id="link" href="#navigation-target">Link</Toolbar.Link>
    <Toolbar.Group id="toolbar-group" disabled={config.groupDisabled}>
      <Toolbar.Button
        id="two"
        disabled={itemDisabled}
        focusableWhenDisabled={focusable}
        nativeButton={!config.custom}
        render={config.custom ? customButton : undefined}
        onclick={() => clicks++}
        onmousemove={() => hover++}
        onkeydown={() => keydowns++}
        bind:ref
        {@attach attachHost}>Two</Toolbar.Button
      >
      <Toolbar.Button id="three">Three</Toolbar.Button>
    </Toolbar.Group>
    <Toolbar.Input id="tested-input" defaultValue="" />
    <Toolbar.Separator
      id="separator"
      {...config.separatorOverride ? { orientation: 'horizontal' as const } : {}}
    />
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <DirectionProvider {direction}>
    <form id="navigation-form" onreset={() => resets++}>
      {#if shown}
        {#if config.toolbar}
          <Toolbar.Root
            id="toolbar"
            {orientation}
            dir={direction}
            disabled={config.rootDisabled}
            loopFocus={config.loopFocus}
          >
            {@render toolbarChildren()}
          </Toolbar.Root>
        {:else}
          {@render selectionGroup()}
        {/if}
      {/if}
      <button id="outside" type="button">Outside</button>
      <button type="reset">Reset native input</button>
    </form>
  </DirectionProvider>
  <button onclick={() => (multiple = !multiple)}>Change multiple</button>
  <button onclick={() => (owner = owner?.[0] === 'one' ? ['two'] : ['one'])}>Change owner</button>
  <button onclick={() => (itemDisabled = !itemDisabled)}>Change disabled</button>
  <button onclick={() => (inputDisabled = !inputDisabled)}>Enable input</button>
  <button onclick={() => (focusable = !focusable)}>Change focusable</button>
  <button onclick={() => (items = [...items].reverse())}>Reorder items</button>
  <button onclick={() => (items = items.filter((value) => value !== 'two'))}>Remove two</button>
  <button onclick={() => (shown = !shown)}>Toggle mount</button>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="input-events">{JSON.stringify({ clicks, hover, keydowns, resets })}</output>
  <output data-testid="host-ref">{ref?.id ?? ''}</output>
  <output data-testid="attachments">{JSON.stringify({ attached, detached })}</output>
  <div id="navigation-target">Navigation target</div>
</main>
