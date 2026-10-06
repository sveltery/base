<script lang="ts" generics="State extends object = Record<string, unknown>">
  import { mergeComponentProps } from '../../mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Base UI v1.8.0 CompositeItem source composition; MIT: THIRD_PARTY_NOTICES.md.
  import { type Snippet } from 'svelte';
  import type { BaseUIComponentProps, HTMLProps } from '../../types.js';
  import type { StateAttributesMapping } from '../../getStateAttributesProps.js';
  import { useCompositeItem } from './useCompositeItem.svelte.js';
  let {
    render,
    class: classProp,
    style,
    state = {} as State,
    props = [],
    ref = $bindable(),
    metadata,
    stateAttributesMapping,
    tag = 'div',
    children,
    ...elementProps
  }: HTMLProps &
    BaseUIComponentProps<State> & {
      state?: State;
      props?: readonly (HTMLProps | ((props: HTMLProps) => HTMLProps))[];
      ref?: HTMLElement | null | undefined;
      metadata?: Record<string, unknown>;
      stateAttributesMapping?: StateAttributesMapping<State>;
      tag?: string;
      children?: Snippet;
    } = $props();
  const composite = useCompositeItem(() => ({ metadata }));

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    ref = host;
    return () => {
      if (ref === host) ref = null;
    };
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style: style },
      [composite.compositeProps, ...props, elementProps],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  {#if tag === 'button'}<button type="button" {...mergedProps}>{@render children?.()}</button
    >{:else if tag === 'a'}<a {...mergedProps}>{@render children?.()}</a
    >{:else if tag === 'span'}<span {...mergedProps}>{@render children?.()}</span
    >{:else if tag === 'input'}<input {...mergedProps} />{:else}<div {...mergedProps}>
      {@render children?.()}
    </div>{/if}
{/if}
