<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../merge-props/index.js';
  let { tag = 'div', internal = {}, props = {}, state = {}, render, children, ref = $bindable(null), attach }: {
    tag?: string; internal?: Record<string, unknown>; props?: Record<string, unknown>; state?: any;
    render?: Snippet<[Record<string | symbol, unknown>, any]>; children?: Snippet;
    ref?: HTMLElement | null; attach?: (node: HTMLElement) => void | (() => void);
  } = $props();
  const attachmentKey = createAttachmentKey();
  function attachment(node: HTMLElement) {
    ref = node;
    const cleanup = attach?.(node);
    return () => { cleanup?.(); if (ref === node) ref = null; };
  }
  function resolveStyle(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).map(([k, v]) => `${k.startsWith('--') ? k : k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}:${v}`).join(';');
  }
  const merged = $derived.by(() => {
    const { class: classProp, style: styleProp, ...rest } = props;
    const resolved = { ...rest, class: typeof classProp === 'function' ? classProp(state) : classProp, style: typeof styleProp === 'function' ? styleProp(state) : styleProp };
    const result = mergeProps(internal, resolved);
    // Svelte's style attribute is a CSS string, unlike React's object representation.
    result.style = resolveStyle(result.style);
    return { ...result, [attachmentKey]: attachment };
  });
</script>
{#if render}
  {@render render(merged, state)}
{:else}
  <svelte:element this={tag} {...merged}>{@render children?.()}</svelte:element>
{/if}
