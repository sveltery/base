<script lang="ts">
  import * as Toast from '../../src/lib/toast/index.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import type { ToastPortalProps } from '../../src/lib/toast/types.js';
  let { initial, initialRef, custom = false, attached = () => {} }: { initial?: ToastPortalProps['container']; initialRef?: HTMLElement | null; custom?: boolean; attached?: (node: HTMLElement) => (() => void) | void } = $props();
  let container = $state.raw(untrack(() => initial));
  let ref = $state<HTMLElement | null | undefined>(untrack(() => initialRef));
  let renderRef = $state<HTMLElement | null>(null);
  let shown = $state(true);
  let id = $state<string>();
  let managedId = $state(false);
  let label = $state('Initial');
  const attachments = { [createAttachmentKey()]: (node: HTMLElement) => attached(node) };
  export function setContainer(value: ToastPortalProps['container']) { container = value; }
  export function setId(value?: string) { managedId = true; id = value; }
  export function setLabel(value: string) { label = value; }
  export function remove() { shown = false; }
  export function getRefs() { return [ref, renderRef]; }
</script>
{#snippet replacement(props: Record<string, unknown>, _state: Record<string, never>, _children: import('svelte').Snippet | undefined)}
  <section data-testid="wrapper"><div {...props} bind:this={renderRef}></div></section>
{/snippet}
{#if shown}
  <Toast.Portal {container} {...(managedId ? { id } : {})} bind:ref render={custom ? replacement : undefined} data-testid="portal" class={() => 'portal-class'} style="color: green" {...attachments}><span data-testid="child">{label}</span></Toast.Portal>
{/if}
