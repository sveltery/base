<script lang="ts">
  // Actual plain Fixture with public ref observations; MIT: parity/radio/UPSTREAM_LICENSE.
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  import CompositeRoot from '../../src/lib/internals/composite/root/CompositeRoot.svelte';
  import CompositeItem from '../../src/lib/internals/composite/item/CompositeItem.svelte';
  import type { CompositeMetadata } from '../../src/lib/internals/composite/list/CompositeListContext.js';

  let { onMap }: { onMap: (map: Map<Element, CompositeMetadata>) => void } = $props();
  const outer = { disabled: true, focusableWhenDisabled: true, owner: 'outer' };
  let revision = $state(0);
  let visible = $state(true);
  let hostTag = $state('button');
  let inner = $derived({ disabled: true, focusableWhenDisabled: false, owner: 'inner', revision });
  let map = $state.raw(new Map<Element, CompositeMetadata>());
  const disabledIndices = $derived(
    [...map.values()]
      .filter((item) => item.disabled && !item.focusableWhenDisabled)
      .map((item) => item.index),
  );

  let rootRef = $state.raw<HTMLElement | null>();
  let firstRef = $state.raw<HTMLElement | null>();
  let outerRef = $state.raw<HTMLElement | null>();
  let innerRef = $state.raw<HTMLElement | null>();
  let lastRef = $state.raw<HTMLElement | null>();

  export function getRefs() {
    return { root: rootRef, first: firstRef, outer: outerRef, inner: innerRef, last: lastRef };
  }
  export function updateInner() {
    revision += 1;
  }
  export function setVisible(value: boolean) {
    visible = value;
  }
  export function replaceHost() {
    hostTag = hostTag === 'button' ? 'span' : 'button';
  }
</script>

<CompositeRoot
  orientation="horizontal"
  {disabledIndices}
  bind:ref={rootRef}
  onMapChange={(value) => {
    map = value;
    onMap(value);
  }}
>
  <CompositeItem tag="button" metadata={outer} bind:ref={firstRef} data-testid="first"
    >First</CompositeItem
  >
  {#if visible}
    <CompositeItem tag="button" metadata={outer} bind:ref={outerRef}>
      {#snippet render(props: HTMLProps)}
        <CompositeItem
          tag={hostTag}
          metadata={inner}
          {...props}
          bind:ref={innerRef}
          data-testid="shared">Shared</CompositeItem
        >
      {/snippet}
    </CompositeItem>
  {/if}
  <CompositeItem tag="button" metadata={outer} bind:ref={lastRef} data-testid="last"
    >Last</CompositeItem
  >
</CompositeRoot>
