<script lang="ts">
  // Native counterpart of pinned nested Composite contracts; MIT: parity/radio/UPSTREAM_LICENSE.
  import { onMount, untrack, type Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { HTMLProps } from '../../../../packages/base/dist/internals/types.js';
  import CompositeRoot from '../../../../packages/base/dist/internals/composite/root/CompositeRoot.svelte';
  import CompositeItem from '../../../../packages/base/dist/internals/composite/item/CompositeItem.svelte';
  import type { CompositeMetadata } from '../../../../packages/base/dist/internals/composite/list/CompositeListContext.js';

  const outer = { disabled: true, focusableWhenDisabled: true, owner: 'outer' };
  let hydrated = $state(false);
  let revision = $state(0);
  let visible = $state(true);
  let rootVisible = $state(true);
  let hostTag = $state('button');
  let rootRef = $state<HTMLElement | null>();
  let firstRef = $state<HTMLElement | null>();
  let outerRef = $state<HTMLElement | null>();
  let innerRef = $state<HTMLElement | null>();
  let lastRef = $state<HTMLElement | null>();
  let literalHostRef = $state<HTMLElement>();
  let literalOuterRef = $state<HTMLElement | null>();
  let literalInnerRef = $state<HTMLElement | null>();
  let inner = $derived({ disabled: true, focusableWhenDisabled: false, owner: 'inner', revision });
  let map = $state.raw(new Map<Element, CompositeMetadata>());
  const publications: [Element, CompositeMetadata][][] = [];
  const literalEvents: {
    phase: 'attach' | 'cleanup';
    host: HTMLElement;
    metadata: Record<string, unknown>;
  }[] = [];
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

  // Plain native control: independent symbols, with no registration or order policy.
  const literalOuterKey = createAttachmentKey();
  const literalInnerKey = createAttachmentKey();
  function attachLiteralOuter(host: HTMLElement) {
    literalOuterRef = host;
    literalEvents.push({ phase: 'attach', host, metadata: outer });
    return () => {
      untrack(() => {
        literalEvents.push({ phase: 'cleanup', host, metadata: outer });
        if (literalOuterRef === host) literalOuterRef = null;
      });
    };
  }
  function attachLiteralInner(host: HTMLElement) {
    const metadata = inner;
    return untrack(() => {
      literalInnerRef = host;
      literalEvents.push({ phase: 'attach', host, metadata });
      return () => {
        untrack(() => {
          literalEvents.push({ phase: 'cleanup', host, metadata });
          if (literalInnerRef === host) literalInnerRef = null;
        });
      };
    });
  }
  const literalAttachments = {
    [literalOuterKey]: attachLiteralOuter,
    [literalInnerKey]: attachLiteralInner,
  };

  onMount(() => {
    hydrated = true;
    // Read actual native hosts/publications while this fixture remains alive after Root removal.
    const diagnostic = {
      read() {
        return {
          hydrated,
          revision,
          visible,
          rootVisible,
          hostTag,
          innerMetadata: inner,
          publishedMap: [...map],
          publications,
          refs: { root: rootRef, first: firstRef, outer: outerRef, inner: innerRef, last: lastRef },
          literal: {
            refs: { host: literalHostRef, outer: literalOuterRef, inner: literalInnerRef },
            events: literalEvents,
          },
        };
      },
    };
    const target = window as Window & { compositeNestedDiagnostic?: typeof diagnostic };
    target.compositeNestedDiagnostic = diagnostic;
    return () => {
      if (target.compositeNestedDiagnostic === diagnostic) delete target.compositeNestedDiagnostic;
    };
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
  <button id="remove-root" onclick={() => (rootVisible = false)}>Remove native Root</button>
  <output id="nested-map">{JSON.stringify(observations)}</output>
  {#if rootVisible}
    <CompositeRoot
      id="nested-root"
      bind:ref={rootRef}
      orientation="horizontal"
      {disabledIndices}
      onMapChange={(value) => {
        map = value;
        publications.push(
          [...value].map(([node, metadata]): [Element, CompositeMetadata] => [
            node,
            { ...metadata },
          ]),
        );
      }}
    >
      <CompositeItem
        tag="button"
        metadata={outer}
        bind:ref={firstRef}
        id="nested-first"
        data-testid="first">First</CompositeItem
      >
      {#if visible}
        <CompositeItem tag="button" metadata={outer} bind:ref={outerRef}>
          {#snippet render(
            props: HTMLProps,
            _state: Record<string, unknown>,
            children: Snippet | undefined,
          )}
            <CompositeItem
              tag={hostTag}
              metadata={inner}
              {...props}
              bind:ref={innerRef}
              id="nested-shared"
              data-testid="shared">{@render children?.()}</CompositeItem
            >
          {/snippet}
          Shared
        </CompositeItem>
      {/if}
      <CompositeItem
        tag="button"
        metadata={outer}
        bind:ref={lastRef}
        id="nested-last"
        data-testid="last">Last</CompositeItem
      >
    </CompositeRoot>
    {#if visible}
      {#if hostTag === 'button'}
        <button
          type="button"
          {...literalAttachments}
          bind:this={literalHostRef}
          id="literal-shared"
          tabindex="-1">Literal native attachments</button
        >
      {:else}
        <span {...literalAttachments} bind:this={literalHostRef} id="literal-shared" tabindex="-1"
          >Literal native attachments</span
        >
      {/if}
    {/if}
  {/if}
</main>
