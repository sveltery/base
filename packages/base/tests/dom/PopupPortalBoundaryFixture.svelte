<script lang="ts">
  import Full from '../../src/lib/floating-ui/components/FloatingPortal.svelte';
  import Lite from '../../src/lib/utils/FloatingPortalLite.svelte';
  import Probe from './PopupPortalBoundaryProbe.svelte';
  import type { PortalContainer } from '../../src/lib/floating-ui/hooks/useFloatingPortalNode.svelte.js';
  import type { FloatingPortalContext } from '../../src/lib/floating-ui/components/FloatingPortalContext.js';
  import { createAttachmentKey, type Attachment } from 'svelte/attachments';

  let {
    container,
    lite = false,
    customHost = false,
    customId = 'custom-portal',
    nested,
    focus = false,
    forwardedAttachment,
  }: {
    container?: PortalContainer;
    lite?: boolean;
    customHost?: boolean;
    customId?: string;
    nested?: 'full' | 'lite';
    focus?: boolean;
    forwardedAttachment?: Attachment<HTMLElement>;
  } = $props();
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Imperative fixture report registry is read through exported methods, not reactive markup.
  const contexts = new Map<string, FloatingPortalContext | null>();
  let hostTag = $state<'section' | 'article'>('section');
  let hostRef = $state<HTMLElement | null>();
  const authoredKey = createAttachmentKey();
  export function getHost() {
    return hostRef;
  }
  function report(name: string, context: FloatingPortalContext | null) {
    contexts.set(name, context);
  }
  export function readContext(name: string) {
    return contexts.get(name);
  }
  export function setContainer(value: PortalContainer | undefined) {
    container = value;
  }
  export function setCustomId(value: string) {
    customId = value;
  }
  export function setAttachment(value: Attachment<HTMLElement>) {
    forwardedAttachment = value;
  }
  export function setHostTag(value: 'section' | 'article') {
    hostTag = value;
  }
  export function mutateContainerCurrent(
    value: HTMLElement | ShadowRoot | null,
  ) {
    if (container && !('nodeType' in container)) container.current = value;
  }
</script>

{#snippet host(props: import('../../src/lib/internals/types.js').HTMLProps)}
  {#if hostTag === 'section'}<section {...props} id={customId}>
      <Probe name="host" {report} />
    </section>
  {:else}<article {...props} id={customId}>
      <Probe name="host" {report} />
    </article>{/if}
{/snippet}
{#snippet child()}
  <Probe name="child" {report} {focus} />
  <span data-testid="portal-child">Child</span>
  {#if nested === 'full'}
    <Full data-testid="nested-portal"
      ><Probe name="nested-child" {report} /><span data-testid="nested-child"
        >Nested</span
      ></Full
    >
  {:else if nested === 'lite'}
    <Lite data-testid="nested-portal"
      ><Probe name="nested-child" {report} /><span data-testid="nested-child"
        >Nested</span
      ></Lite
    >
  {/if}
{/snippet}
{#if lite}
  <Lite
    {container}
    bind:ref={hostRef}
    {...{ [authoredKey]: forwardedAttachment }}
    render={customHost ? host : undefined}
    data-testid="boundary-portal"
    class={['portal', { native: true }]}
    style="--host-color: red;">{@render child()}</Lite
  >
{:else}
  <Full
    {container}
    bind:ref={hostRef}
    {...{ [authoredKey]: forwardedAttachment }}
    render={customHost ? host : undefined}
    data-testid="boundary-portal"
    class={['portal', { native: true }]}
    style="--host-color: red;">{@render child()}</Full
  >
{/if}
