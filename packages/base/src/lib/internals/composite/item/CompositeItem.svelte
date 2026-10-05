<script lang="ts" generics="State extends object = Record<string, unknown>">
  // Base UI v1.8.0 CompositeItem source composition; MIT: THIRD_PARTY_NOTICES.md.
  import type { Snippet } from 'svelte';
  import type { BaseUIComponentProps, HTMLProps } from '../../types.js';
  import type { MergedRef } from '@sveltery/utils/useMergedRefs';
  import type { StateAttributesMapping } from '../../getStateAttributesProps.js';
  import RenderElement from '../../RenderElement.svelte';
  import { useCompositeItem } from './useCompositeItem.svelte.js';
  let {
    render,
    class: classProp,
    style,
    state = {} as State,
    props = [],
    refs = [],
    metadata,
    stateAttributesMapping,
    tag = 'div',
    children,
    ...elementProps
  }: HTMLProps &
    BaseUIComponentProps<State> & {
      state?: State;
      props?: readonly (HTMLProps | ((props: HTMLProps) => HTMLProps))[];
      refs?: readonly MergedRef<HTMLElement>[];
      metadata?: Record<string, unknown>;
      stateAttributesMapping?: StateAttributesMapping<State>;
      tag?: string;
      children?: Snippet;
    } = $props();
  const composite = useCompositeItem(() => ({ metadata }));
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state,
    ref: [composite.compositeRef, ...refs],
    props: [composite.compositeProps, ...props, elementProps],
    stateAttributesMapping,
  });
</script>
<RenderElement {tag} {componentProps} {params} {children} />
