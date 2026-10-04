<script lang="ts">
  // Source Tabs assertion fixture adapter plus separately labeled native supplements. MIT.
  import { onMount, untrack } from 'svelte';
  import { Tabs } from '@sveltery/base/tabs';
  import { DirectionProvider } from '@sveltery/base/direction-provider';
  import { CSPProvider } from '@sveltery/base/csp-provider';
  import type {
    TabsRootChangeEventDetails,
    TabsTabValue,
  } from '@sveltery/base/tabs';
  import type { HTMLAttributes } from 'svelte/elements';
  let { scenario: scenarioProp = 'default' }: { scenario?: string } = $props();
  const scenario = untrack(() => scenarioProp);
  const implicit = scenario.includes('implicit') || scenario === 'all-disabled';
  const controlled = scenario.includes('controlled');
  const initial = scenario.includes('null')
    ? null
    : scenario.includes('missing')
      ? 99
      : scenario.includes('selected-last')
        ? 2
        : 0;
  const values = scenario.includes('objects')
    ? [{ key: 'a' }, { key: 'b' }, { key: 'c' }]
    : [0, 1, 2];
  let owner = $state.raw<TabsTabValue>(
    initial === null ? null : (values[initial] ?? initial),
  );
  let hydrated = $state(false),
    show = $state(true),
    items = $state([0, 1, 2]),
    swapped = $state(false),
    wide = $state(false),
    duplicate = $state(false),
    dropOriginal = $state(false);
  let disabled = $state(
    scenario.includes('disabled-first')
      ? [0]
      : scenario === 'all-disabled'
        ? [0, 1, 2]
        : scenario.includes('disabled-middle')
          ? [1]
          : [],
  );
  let calls = $state<unknown[]>([]),
    events = $state<string[]>([]);
  let tabRef = $state<HTMLElement | null>(),
    listRef = $state<HTMLElement | null>();
  const keep = scenario.includes('keep');
  const activation = scenario.includes('activate');
  const flow = scenario.includes('vertical') ? 'vertical' : 'horizontal';
  function change(next: TabsTabValue, details: TabsRootChangeEventDetails) {
    if (scenario.includes('cancel')) details.cancel();
    calls.push({
      value: next,
      reason: details.reason,
      direction: details.activationDirection,
      type: details.event.type,
      canceled: details.isCanceled,
    });
    if (!scenario.includes('reject') && !details.isCanceled) owner = next;
  }
  function consumer(event: Event & { preventBaseUIHandler(): void }) {
    events.push(event.type);
    if (scenario.includes('prevent-handler')) event.preventBaseUIHandler();
    if (scenario.includes('prevent-default')) event.preventDefault();
  }
  onMount(() => {
    hydrated = true;
  });
</script>
<main data-hydrated={hydrated} data-renderer="svelte">
  <button id="before">Before</button>
  <button id="external" onclick={() => { owner = values[2]; }}>External last</button>
  <button id="external-null" onclick={() => { owner = null; }}>External null</button>
  <button id="disable" onclick={() => { disabled = [Number(document.querySelector('[aria-selected=true]')?.getAttribute('data-testid')?.replace('tab-', '') ?? 0)]; }}>Disable selected</button>
  <button id="enable" onclick={() => { disabled = []; }}>Enable all</button>
  <button id="remove" onclick={() => { items = items.filter(index => values[index] !== owner); }}>Remove selected</button>
  <button id="clear" onclick={() => { items = []; }}>Remove all</button>
  <button id="insert" onclick={() => { items = [0, 1, 2]; }}>Restore</button>
  <button id="reorder" onclick={() => { items = [...items].reverse(); }}>Reverse</button>
  <button id="swap" onclick={() => { swapped = !swapped; }}>Swap tab host</button>
  <button id="resize" onclick={() => { wide = !wide; }}>Resize</button>
  <button id="duplicate" onclick={() => { duplicate = !duplicate; }}>Duplicate panel</button>
  <button id="drop-original" onclick={() => { dropOriginal = !dropOriginal; }}>Toggle original panel</button>
  <button id="unmount" onclick={() => { show = !show; }}>Toggle tree</button>
  <DirectionProvider direction={scenario.includes('rtl') ? 'rtl' : 'ltr'}>
    <CSPProvider nonce="tabs-nonce">
      {#if show}
        <Tabs.Root value={controlled ? owner : undefined} defaultValue={implicit ? undefined : initial === null ? null : values[initial] ?? initial} orientation={flow} onValueChange={change} id="tabs-root" dir={scenario.includes('rtl') ? 'rtl' : undefined}>
          <Tabs.List id="tabs-list" class="tabs-list" style={wide ? 'width:560px' : undefined} activateOnFocus={activation} loopFocus={!scenario.includes('no-loop')} aria-label="Example tabs" bind:ref={listRef}>
            {#each items as index (index)}
              <div class="tab-wrapper" style={scenario.includes('inner-scroll') ? 'width:110px;overflow:auto' : undefined}>
                <Tabs.Tab value={values[index]} id={`tab-${index}`} data-testid={`tab-${index}`} disabled={disabled.includes(index)}
                  style={index === 0 && wide ? 'width:155px' : index === 2 && scenario.includes('translate-percent') ? 'translate:10% 20%' : index === 2 && scenario.includes('translate-longhand') ? 'translate:12px 8px' : index === 2 && scenario.includes('translate') ? 'transform:translate(12px,8px)' : undefined}
                  nativeButton={!scenario.includes('custom') && !scenario.includes('caret') && !(swapped && index === 1)}
                  onclick={scenario.includes('prevent') ? consumer : undefined} onfocusin={scenario.includes('prevent-focus') ? consumer : undefined}
                  autofocus={scenario.includes('autofocus') && index === 2} bind:ref={tabRef}>
                  {#snippet render(props, state, children)}
                    {#if scenario.includes('custom') || scenario.includes('caret') || (swapped && index === 1)}
                      <div {...props as HTMLAttributes<HTMLDivElement>} class={`tabs-tab ${state.active ? 'active' : ''}`}>{@render children?.()}</div>
                    {:else}<button {...props} class={`tabs-tab ${state.active ? 'active' : ''}`}>{@render children?.()}</button>{/if}
                  {/snippet}
                  Tab {index}
                  {#if scenario.includes('caret')}<input aria-label={`Textbox ${index}`} value="text" />{/if}
                </Tabs.Tab>
              </div>
            {/each}
            <Tabs.Indicator data-testid="indicator" class="tabs-indicator" renderBeforeHydration={scenario.includes('prehydrate')}>
              {#snippet render(props, state, children)}
                <span {...props} data-position={JSON.stringify(state.activeTabPosition)} data-size={JSON.stringify(state.activeTabSize)}>{@render children?.()}</span>
              {/snippet}
            </Tabs.Indicator>
            {#if scenario.includes('multiple-indicators')}<Tabs.Indicator data-testid="indicator-two" class="tabs-indicator" />{/if}
          </Tabs.List>
          {#each items as index (index)}
            {#if index !== 0 || !dropOriginal}<Tabs.Panel value={values[index]} data-testid={`panel-${index}`} keepMounted={keep} style={scenario.includes('transition') ? 'transition:opacity 800ms;opacity:1' : undefined}>
              Panel {index}<input aria-label={`Panel field ${index}`} value={`seed ${index}`} />
            </Tabs.Panel>{/if}
          {/each}
          {#if duplicate}<Tabs.Panel value={values[0]} keepMounted data-testid="duplicate-panel">Duplicate</Tabs.Panel>{/if}
        </Tabs.Root>
      {/if}
    </CSPProvider>
  </DirectionProvider>
  <button id="after">After</button>
  <output id="calls">{JSON.stringify(calls)}</output>
  <output id="events">{JSON.stringify(events)}</output>
  <output id="owner">{JSON.stringify(owner)}</output>
  <output id="refs">{`${listRef?.id ?? 'null'}|${tabRef?.id ?? 'null'}`}</output>

</main>
