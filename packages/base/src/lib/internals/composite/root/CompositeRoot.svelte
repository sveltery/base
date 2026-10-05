<script lang="ts" generics="State extends object = Record<string, unknown>">
  import { mergeComponentProps } from '../../mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Base UI v1.8.0 CompositeRoot source composition; MIT: THIRD_PARTY_NOTICES.md.
  import { type Snippet } from 'svelte';
  import type { BaseUIComponentProps, HTMLProps } from '../../types.js';
  import type { StateAttributesMapping } from '../../getStateAttributesProps.js';
  import { useDirection } from '../../../direction-provider/context.js';
  import { createCompositeList } from '../list/createCompositeList.svelte.js';
  import type { CompositeMetadata } from '../list/CompositeListContext.js';
  import {
    useCompositeRoot,
    type UseCompositeRootParameters,
  } from './useCompositeRoot.svelte.js';
  import { setCompositeRootContext } from './CompositeRootContext.js';
  let {
    render,
    class: classProp,
    style,
    ref = $bindable(),
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
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    children,
    ...elementProps
  }: HTMLProps &
    BaseUIComponentProps<State> &
    Omit<UseCompositeRootParameters, 'direction'> & {
      ref?: HTMLElement | null | undefined;
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
      [composite.getProps(), ...props, elementProps],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
