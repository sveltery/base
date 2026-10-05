<script lang="ts">
  // Source: Base UI v1.8.0 ListboxSeparator.tsx at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  // MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
  import RenderElement from '../../internals/RenderElement.svelte';
  import type { ListboxSeparatorProps, ListboxSeparatorState } from './types.js';

  let {
    class: classProp,
    render,
    orientation = 'horizontal',
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ListboxSeparatorProps = $props();

  const state: ListboxSeparatorState = $derived({ orientation });
  const forwardedRef = {
    get current() { return ref ?? null; },
    set current(element: HTMLElement | null) { ref = element; },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state,
    ref: forwardedRef,
    props: [{ role: 'presentation' }, elementProps],
  });
</script>

<RenderElement tag="div" {componentProps} {params} {children} />
