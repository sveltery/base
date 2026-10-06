<script lang="ts">
  // Native counterpart of pinned nested Composite contracts; MIT: parity/radio/UPSTREAM_LICENSE.
  import { onMount } from 'svelte';
  import type { HTMLProps } from '../../../../packages/base/dist/internals/types.js';
  import CompositeRoot from '../../../../packages/base/dist/internals/composite/root/CompositeRoot.svelte';
  import CompositeItem from '../../../../packages/base/dist/internals/composite/item/CompositeItem.svelte';
  import type { CompositeMetadata } from '../../../../packages/base/dist/internals/composite/list/CompositeListContext.js';

  const outer = { disabled: true, focusableWhenDisabled: true, owner: 'outer' };
  let hydrated = $state(false);
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
  const observations = $derived(
    [...map].map(([node, metadata]) => ({
      testId: node.getAttribute('data-testid'),
      tag: node.tagName,
      ...metadata,
    })),
  );

  onMount(() => {
    hydrated = true;
  });
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

<main data-hydrated={hydrated} data-renderer="svelte">
  <button id="update-inner" onclick={updateInner}>Update inner</button>
  <button id="toggle-shared" onclick={() => setVisible(!visible)}>Toggle shared</button>
  <button id="replace-host" onclick={replaceHost}>Replace host</button>
  <output id="nested-map">{JSON.stringify(observations)}</output>
  <CompositeRoot
    orientation="horizontal"
    {disabledIndices}
    onMapChange={(value) => {
      map = value;
    }}
  >
    <CompositeItem tag="button" metadata={outer} data-testid="first">First</CompositeItem>
    {#if visible}
      <CompositeItem tag="button" metadata={outer}>
        {#snippet render(props: HTMLProps)}
          <CompositeItem tag={hostTag} metadata={inner} {...props} data-testid="shared"
            >Shared</CompositeItem
          >
        {/snippet}
      </CompositeItem>
    {/if}
    <CompositeItem tag="button" metadata={outer} data-testid="last">Last</CompositeItem>
  </CompositeRoot>
</main>
