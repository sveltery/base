<script lang="ts">
  // Paired assertion fixtures for Base UI 47b40521; MIT: parity/avatar/UPSTREAM_LICENSE.
  import { onMount, untrack } from 'svelte';
  import { Avatar, type AvatarImageState, type AvatarRootState } from '../../../../packages/base/src/lib/avatar/index.js';
  import { mergeProps } from '@sveltery/base';
  import { avatarConfig, avatarDataUri, avatarMockSource, avatarNextMockSource, avatarNextRealSource } from './avatar-harness.js';
  let { scenario = 'pending' }: { scenario?: string } = $props();
  const initial = untrack(() => avatarConfig(scenario));
  let src = $state(initial.src), delay = $state<number | undefined>(initial.delay), shown = $state(true), updated = $state(false), callback = $state('initial'), host = $state(0), hydrated = $state(false);
  const renderedSource = $derived(['keep-render-source', 'keep-callback-source'].includes(scenario));
  const replacement = $derived(renderedSource || ['keep-order', 'real-keep-replacement', 'dropped-ref'].includes(scenario));
  const sourceInRender = $derived(src ?? (initial.real ? avatarDataUri : avatarMockSource));
  const record = (status: string) => { window.avatarHarness.statuses.push(status); window.avatarHarness.callbacks.push(`${callback}:${status}`); };
  const event = (kind: string, event: Event & { preventBaseUIHandler?: () => void }) => { window.avatarHarness.events.push(kind); if (scenario === 'keep-prevent') event.preventBaseUIHandler?.(); if (scenario === 'keep-default-prevent') event.preventDefault(); };
  onMount(() => { hydrated = true; });
</script>
{#snippet imageReplacement(props: Record<string | symbol, unknown>, state: AvatarImageState)}
  {const extras = $derived(renderedSource ? { sizes: '48px', src: sourceInRender, srcset: `${sourceInRender} 1x` } : {})}
  {const supplied = $derived(mergeProps(extras, props, { class: updated ? 'updated' : 'initial', 'data-state': state.imageLoadingStatus }))}
  {#if scenario === 'dropped-ref'}
    {const withoutAttachment = $derived(Object.fromEntries(Object.entries(supplied)))}
    <img alt="" {...withoutAttachment} data-testid="image" data-source-keys={Object.keys(props).join(",")} />
  {:else}
    {#key host}<img alt="" {...supplied} data-testid="image" data-source-keys={Object.keys(props).join(",")} />{/key}
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <button onclick={() => src = initial.real ? avatarNextRealSource : avatarNextMockSource}>Set source</button>
  <button onclick={() => src = initial.real ? avatarDataUri : avatarMockSource}>Show image</button>
  <button onclick={() => src = undefined}>Clear source</button>
  <button onclick={() => shown = false}>Remove image</button><button onclick={() => shown = true}>Restore image</button>
  <button onclick={() => delay = 0}>Delay zero</button><button onclick={() => delay = undefined}>Delay undefined</button><button onclick={() => delay = 1000}>Delay number</button>
  <button onclick={() => updated = true}>Update props</button><button onclick={() => host += 1}>Replace host</button><button onclick={() => callback = 'updated'}>Replace callback</button>
  <Avatar.Root data-testid="root" class={(state: AvatarRootState) => `root-${state.imageLoadingStatus}`}>
    {#if shown}
      <Avatar.Image data-testid="image" alt="Jane Doe" keepMounted={initial.keepMounted} src={renderedSource ? undefined : src} srcset={initial.srcSet} sizes={initial.sizes}
        crossorigin={scenario === 'native' || scenario.endsWith('responsive') ? 'anonymous' : undefined} referrerpolicy={scenario === 'native' || scenario.endsWith('responsive') ? 'no-referrer' : undefined}
        loading={scenario === 'keep-order' ? 'lazy' : undefined} aria-hidden={scenario === 'keep-aria-override' ? false : undefined}
        class={scenario.startsWith('animation') ? 'avatar-animation' : undefined} render={replacement ? imageReplacement : undefined} onLoadingStatusChange={record}
        onload={(e) => event('load', e)} onerror={(e) => event('error', e)} ontransitionend={() => window.avatarHarness.events.push('transitionend')} />
    {/if}
    <Avatar.Fallback {delay} data-testid="fallback" class="avatar-fallback">JD</Avatar.Fallback>
  </Avatar.Root>
</main>
<style>
  :global(.avatar-animation) { transition: opacity 30ms; opacity: 1; }
  :global(.avatar-animation[data-starting-style]) { opacity: 0; }
  :global(.avatar-animation[data-ending-style]) { animation: avatar-exit 400ms; }
  :global(.avatar-fallback[data-ending-style]) { animation: avatar-exit 2s; }
  @keyframes -global-avatar-exit { to { opacity: 0; } }
</style>
