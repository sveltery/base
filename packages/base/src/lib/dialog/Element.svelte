<script lang="ts" generics="State">
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack, type Snippet } from 'svelte';
  import { mergeProps } from '../merge-props/index.js';
  let { tag = 'div', internal = {}, props = {}, state = {} as State, render, children, ref = $bindable(null), attach }: {
    tag?: string; internal?: Record<string, unknown>; props?: Record<string, unknown>; state?: State;
    render?: Snippet<[Record<string | symbol, unknown>, State, Snippet | undefined]>; children?: Snippet;
    ref?: HTMLElement | null; attach?: (node: HTMLElement) => void | (() => void);
  } = $props();
  const attachmentKey = createAttachmentKey();
  function attachment(node: HTMLElement) {
    ref = node;
    const cleanup = untrack(() => attach?.(node));
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
    result.style = typeof resolved.style === 'string' ? [resolveStyle(internal.style), resolved.style].filter(Boolean).join(';') : resolveStyle(result.style);
    return { ...result, [attachmentKey]: attachment };
  });
</script>
{#if render}
  {@render render(merged, state, children)}
{:else}
  <svelte:element this={tag} {...merged}>{@render children?.()}</svelte:element>
{/if}
