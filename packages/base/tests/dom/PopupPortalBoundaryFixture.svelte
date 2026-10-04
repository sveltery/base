<script lang="ts">
  import Full from '../../src/lib/floating-ui/components/FloatingPortal.svelte';
  import Lite from '../../src/lib/utils/FloatingPortalLite.svelte';
  import Probe from './PopupPortalBoundaryProbe.svelte';
  import type { PortalContainer } from '../../src/lib/floating-ui/hooks/useFloatingPortalNode.svelte.js';
  import type { FloatingPortalContext } from '../../src/lib/floating-ui/components/FloatingPortalContext.js';
  import type { MergedRef } from '../../src/lib/utils/useMergedRefs.js';

  let { container, lite = false, customHost = false, customId = 'custom-portal', nested,
    focus = false, forwardedRef }: {
    container?: PortalContainer;
    lite?: boolean;
    customHost?: boolean;
    customId?: string;
    nested?: 'full' | 'lite';
    focus?: boolean;
    forwardedRef?: MergedRef<HTMLElement>;
  } = $props();
  const contexts = new Map<string, FloatingPortalContext | null>();
  function report(name: string, context: FloatingPortalContext | null) { contexts.set(name, context); }
  export function readContext(name: string) { return contexts.get(name); }
  export function setContainer(value: PortalContainer | undefined) { container = value; }
  export function setCustomId(value: string) { customId = value; }
  export function setRef(value: MergedRef<HTMLElement>) { forwardedRef = value; }
  export function mutateContainerCurrent(value: HTMLElement | ShadowRoot | null) {
    if (container && !('nodeType' in container)) container.current = value;
  }
</script>

{#snippet host(props: import('../../src/lib/internals/types.js').HTMLProps)}
  <section {...props} id={customId}><Probe name="host" {report} /></section>
{/snippet}
{#snippet child()}
  <Probe name="child" {report} {focus} />
  <span data-testid="portal-child">Child</span>
  {#if nested === 'full'}
    <Full data-testid="nested-portal"><Probe name="nested-child" {report}/><span data-testid="nested-child">Nested</span></Full>
  {:else if nested === 'lite'}
    <Lite data-testid="nested-portal"><Probe name="nested-child" {report}/><span data-testid="nested-child">Nested</span></Lite>
  {/if}
{/snippet}
{#if lite}
  <Lite {container} ref={forwardedRef} render={customHost ? host : undefined}
    data-testid="boundary-portal" class={['portal', { native: true }]} style="--host-color: red;">{@render child()}</Lite>
{:else}
  <Full {container} ref={forwardedRef} render={customHost ? host : undefined}
    data-testid="boundary-portal" class={['portal', { native: true }]} style="--host-color: red;">{@render child()}</Full>
{/if}
