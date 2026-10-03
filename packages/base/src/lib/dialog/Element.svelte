<script lang="ts" generics="State extends object">
  // Temporary legacy call-shape adapter. All rendering/merging/refs use the pinned shared closure.
  import type { Snippet } from 'svelte';
  import RenderElement from '../internals/RenderElement.svelte';
  import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
  import type { HTMLProps } from '../internals/types.js';
  import type { NativeStyle } from '../internals/nativeProps.js';
  import type { ClassValue } from 'svelte/elements';
  let { tag = 'div', internal = {}, props = {}, state = {} as State, render, children, ref = $bindable(), attach }: {
    tag?: string; internal?: HTMLProps; props?: HTMLProps; state?: State;
    render?: Snippet<[HTMLProps, State, Snippet | undefined]>; children?: Snippet;
    ref?: HTMLElement | null; attach?: (node: HTMLElement) => void | (() => void);
  } = $props();
  const componentProps = $derived.by(() => {
    const { class: classProp, style: styleProp } = props;
    return { render, class: classProp as ClassValue | ((state: State) => ClassValue), style: styleProp as NativeStyle | ((state: State) => NativeStyle | undefined) };
  });
  const elementProps = $derived.by(() => {
    const { class: _class, style: _style, ...rest } = props;
    void _class; void _style;
    return rest;
  });
  const legacyStateAttributesMapping = $derived.by(() => {
    // Legacy callers already provide mapped attributes. Each component must replace this
    // suppression with its actual pinned mapping during its own source audit; no clearance implied.
    const mapping: StateAttributesMapping<State> = {};
    for (const key in state) mapping[key] = () => null;
    return mapping;
  });
  function attachmentRef(node: HTMLElement | null) { if (node) return attach?.(node); }
</script>
<RenderElement {tag} {componentProps} params={{ state, props: [internal, elementProps], ref: attachmentRef, stateAttributesMapping: legacyStateAttributesMapping }} {children} bind:element={ref} />
