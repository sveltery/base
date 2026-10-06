<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import UseRender from '../../src/lib/use-render/UseRender.svelte';
  import RenderElement from '../../src/lib/use-render/RenderElement.svelte';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import type {
    RenderElementProps,
    UseRenderHostProps,
    UseRenderProps,
    UseRenderRef,
    UseRenderTagName,
  } from '../../src/lib/use-render/types.js';
  type State = Record<string, unknown>;
  let {
    options = {},
    internal = false,
    replacement = false,
    replacementTag = 'span',
    owned = {},
    ownedRef,
    observe,
  }: {
    options?: RenderElementProps<State>;
    internal?: boolean;
    replacement?: boolean;
    replacementTag?: UseRenderTagName;
    owned?: UseRenderHostProps;
    ownedRef?: UseRenderRef;
    observe?: (props: UseRenderHostProps, state: State) => void;
  } = $props();
  let current = $state.raw(untrack(() => options));
  let own = $state.raw(untrack(() => owned));
  let tag = $state(untrack(() => replacementTag));
  let element = $state<Element | null | undefined>();
  const ownAttachment = createAttachmentKey();
  function attachOwn(node: Element) {
    const ref = untrack(() => ownedRef);
    if (!ref) return;
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      return () => {
        if (cleanup) cleanup();
        else ref(null);
      };
    }
    ref.current = node;
    return () => {
      ref.current = null;
    };
  }
  function replacementProps(supplied: UseRenderHostProps, state: State) {
    observe?.(supplied, state);
    const result = mergeProps(supplied, own);
    if (typeof own.style === 'string')
      result.style = [supplied.style, own.style].filter(Boolean).join(';');
    return result;
  }
  export function setOptions(value: RenderElementProps<State>) {
    current = value;
  }
  export function setOwned(value: UseRenderHostProps) {
    own = value;
  }
  export function setTag(value: UseRenderTagName) {
    tag = value;
  }
  export function getElement() {
    return element;
  }
  const parameters = $derived({ ...current, render: replacement ? replacementSnippet : undefined });
</script>

{#snippet replacementSnippet(
  supplied: UseRenderHostProps,
  state: State,
  children: Snippet | undefined,
)}
  {const merged = $derived(replacementProps(supplied, state))}
  <svelte:element this={tag} {...merged} {...{ [ownAttachment]: attachOwn }}
    >{@render children?.()}</svelte:element
  >
{/snippet}
{#if internal}
  <RenderElement {...parameters} bind:element />
{:else}
  <UseRender {...parameters as UseRenderProps<State>} bind:element />
{/if}
