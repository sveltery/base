<script lang="ts">
  // Complete fixture adaptations from Base UI v1.8.0 Toast tests. MIT: parity/toast/UPSTREAM_LICENSE.
  import { Toast } from '@sveltery/base';
  import type { ToastManagerFacade } from '@sveltery/base/toast';
  let { scenario, api, setTimeoutOption, setLimit }: { scenario: string; api?: Pick<ToastManagerFacade, 'add' | 'update' | 'close' | 'promise'>; setTimeoutOption: (value: number) => void; setLimit: (value: number) => void } = $props();
  const facade = Toast.getToastManager();
  const manager = $derived(api ?? facade);
  let count = $state(0);
  let firstToastId = $state('');
  let secondToastId = $state('');
  let mode = $state('fallback');
  const limited = $derived(['limit', 'unlimit', 'limit-sync', 'limited-upsert'].includes(scenario));
  function add() {
    if (scenario === 'manager-upsert') firstToastId = manager.add({ id: 'save', title: 'Saving…', timeout: 1000 });
    else if (limited) { count += 1; manager.add({ title: `toast-${count}` }); }
    else manager.add({ title: scenario === 'manager-add' ? 'title' : 'test', ...(scenario === 'basic-parts' ? { description: 'description', actionProps: { children: 'action' } } : {}) });
  }
</script>
{#if scenario === 'labels'}
  <button onclick={() => { mode = 'explicit'; }}>explicit</button>
  <button onclick={() => { mode = 'none'; }}>none</button>
  <button onclick={() => { mode = 'restored'; }}>restore</button>
{/if}
<Toast.Viewport data-testid="viewport">
  {#if scenario === 'labels'}
    <Toast.Root toast={{ id: 'test', title: 'Toast title', description: 'Toast description' }} swipeDirection={[]} data-testid="root">
      {#if mode !== 'none'}
        <Toast.Title data-testid="title" children={mode === 'explicit' ? 'Explicit title' : undefined} />
        <Toast.Description data-testid="description" children={mode === 'explicit' ? 'Explicit description' : undefined} />
      {/if}
    </Toast.Root>
  {:else}
    {#each facade.toasts as toast (toast.id)}
      <Toast.Root {toast} swipeDirection={[]} data-testid={limited ? String(toast.title) : 'root'}>
        {#if !limited || scenario === 'limited-upsert'}<Toast.Title data-testid="title" />{/if}
        {#if !limited && scenario !== 'close' && scenario !== 'close-all'}<Toast.Description data-testid="description" />{/if}
        {#if scenario !== 'close' && scenario !== 'close-all' && scenario !== 'limited-upsert'}<Toast.Close data-testid={limited ? `close-${toast.title}` : 'close'} aria-label="close-press" />{/if}
        {#if !limited && scenario !== 'close' && scenario !== 'close-all'}<Toast.Action data-testid="action" />{/if}
      </Toast.Root>
    {/each}
  {/if}
{#if limited}{@render controls()}{/if}
</Toast.Viewport>
{#if !limited}{@render controls()}{/if}
{#snippet controls()}
{#if scenario !== 'labels' && scenario !== 'limited-upsert'}<button onclick={add}>add</button>{/if}
{#if scenario === 'manager-upsert'}
  <button onclick={() => { secondToastId = manager.add({ id: 'save', title: 'Saved', timeout: 1000 }); }}>upsert</button>
{/if}
{#if scenario === 'close' || scenario === 'close-all'}<button onclick={() => manager.close(scenario === 'close' ? facade.toasts[0]?.id : undefined)}>close</button>{/if}
{#if scenario === 'timeout-sync'}<button onclick={() => setTimeoutOption(1000)}>timeout 1000</button>{/if}
{#if scenario === 'limit-sync'}
  <button onclick={() => setLimit(2)}>limit 2</button>
  <button onclick={() => setLimit(1)}>limit 1</button>
{/if}
{#if scenario === 'limited-upsert'}
  <button onclick={() => manager.add({ id: 'save', title: 'Saving…', timeout: 0 })}>add save</button>
  <button onclick={() => manager.add({ id: 'other', title: 'Other toast', timeout: 0 })}>add other</button>
  <button onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}>upsert save</button>
{/if}
<output data-testid="ids">{JSON.stringify([firstToastId, secondToastId])}</output>

{/snippet}
