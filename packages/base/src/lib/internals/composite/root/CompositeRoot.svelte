<script lang="ts" generics="State extends object = Record<string, unknown>">
  // Base UI v1.8.0 CompositeRoot source composition; MIT: THIRD_PARTY_NOTICES.md.
  import type { Snippet } from 'svelte';
  import type { BaseUIComponentProps, HTMLProps } from '../../types.js';
  import type { MergedRef } from '../../../utils/useMergedRefs.js';
  import type { StateAttributesMapping } from '../../getStateAttributesProps.js';
  import RenderElement from '../../RenderElement.svelte';
  import { useDirection } from '../../../direction-provider/context.js';
  import { createCompositeList } from '../list/createCompositeList.svelte.js';
  import type { CompositeMetadata } from '../list/CompositeListContext.js';
  import { useCompositeRoot, type UseCompositeRootParameters } from './useCompositeRoot.svelte.js';
  import { setCompositeRootContext } from './CompositeRootContext.js';
  let {
    render,
    class: classProp,
    style,
    refs = [],
    props = [],
    state = {} as State,
    stateAttributesMapping,
    highlightedIndex,
    onHighlightedIndexChange,
    orientation,
    grid,
    loopFocus,
    onLoop,
    enableHomeAndEndKeys,
    onMapChange,
    stopEventPropagation = true,
    rootRef,
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    tag = 'div',
    children,
    ...elementProps
  }: HTMLProps &
    BaseUIComponentProps<State> &
    Omit<UseCompositeRootParameters, 'direction'> & {
      refs?: readonly MergedRef<HTMLElement>[];
      props?: readonly (HTMLProps | ((props: HTMLProps) => HTMLProps))[];
      state?: State;
      stateAttributesMapping?: StateAttributesMapping<State>;
      onMapChange?: (map: Map<Element, CompositeMetadata>) => void;
      highlightItemOnHover?: boolean;
      tag?: string;
      children?: Snippet;
    } = $props();
  const getDirection = useDirection();
  const composite = useCompositeRoot(() => ({
    grid,
    loopFocus,
    onLoop,
    orientation,
    highlightedIndex,
    onHighlightedIndexChange,
    rootRef,
    stopEventPropagation,
    enableHomeAndEndKeys,
    direction: getDirection(),
    disabledIndices,
    modifierKeys,
  }));
  setCompositeRootContext({
    get highlightedIndex() {
      return composite.getHighlightedIndex();
    },
    onHighlightedIndexChange: composite.onHighlightedIndexChange,
    get highlightItemOnHover() {
      return highlightItemOnHover;
    },
    relayKeyboardEvent: composite.relayKeyboardEvent,
  });
  createCompositeList(() => ({
    elementsRef: composite.elementsRef,
    onMapChange(map) {
      onMapChange?.(map);
      composite.onMapChange(map);
    },
  }));
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state,
    ref: refs,
    props: [composite.getProps(), ...props, elementProps],
    stateAttributesMapping,
  });
</script>

<RenderElement {tag} {componentProps} {params} {children} />
