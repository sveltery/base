<script lang="ts" generics="State extends Record<string, unknown>, Host extends Element = Element">
  // Private native closure of pinned useRenderElement (MIT); existing Element remains unchanged.
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import { BROWSER } from 'esm-env';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { EMPTY_STATE, memoRefAttachment, mergeHostProps, refList, resolveSources, stateAttributes } from './props.js';
  import type { RenderElementProps, UseRenderRef } from './types.js';

  let { defaultTagName = 'div', enabled = true, state = EMPTY_STATE as State, stateAttributesMapping, props, class: classProp, style: styleProp, render, ref, element = $bindable(), children }: RenderElementProps<State, Host> = $props();
  const attachmentKey = createAttachmentKey();
  const emptyClassKey = createAttachmentKey();
  function preserveEmptyClass(node: Element) {
    // Svelte's client class normalizer drops '', while the pinned host and native SSR retain it.
    node.setAttribute('class', '');
    // Native attribute updates handle later changes. Teardown must retain the attribute for ref cleanup.
  }
  const referenceAttachment = memoRefAttachment<Host>((node, previous) => untrack(() => {
    if (node !== null || element === previous) element = node;
  }));
  const output = $derived.by(() => {
    // Do not compute attributes, resolve getters/class/style, or inspect replacement props while disabled.
    if (!enabled) return { props: {}, refs: [] };
    const className = resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp);
    const style = typeof styleProp === 'function' ? styleProp(state) : styleProp;
    const stateProps = stateAttributes(state, stateAttributesMapping);
    const resolved = resolveSources(props);
    let host = { ...stateProps, ...resolved };
    // Capture from the fresh merged host: inherited refs are dropped and accessors are read once.
    const refs = BROWSER ? refList(host.ref as UseRenderRef<Host> | null | undefined, ref) : [];
    if (className !== undefined) host = mergeHostProps(host, { class: className });
    if (style !== undefined) host = mergeHostProps(host, { style });
    // Refs are a separate channel: mergeProps deliberately does not compose them.
    const { ref: _ref, ...attributes } = host;
    void _ref;
    const defaults = render ? {} : defaultTagName === 'button' ? { type: 'button' } : defaultTagName === 'img' ? { alt: '' } : {};
    return { props: { [emptyClassKey]: !render && attributes.class === '' ? preserveEmptyClass : undefined, ...defaults, ...attributes, [attachmentKey]: BROWSER ? referenceAttachment(refs, Array.isArray(ref)) : undefined }, refs };
  });
</script>
{#if enabled}
  {#if render}
    {@render render(output.props, state, children)}
  {:else}
    <svelte:element this={defaultTagName} {...output.props}>{@render children?.()}</svelte:element>
  {/if}
{/if}
