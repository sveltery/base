<script lang="ts">
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import RenderElement from '../../src/lib/internals/RenderElement.svelte';
  let { events }: { events: string[] } = $props();
  let innerRevision = $state(0);
  let authoredRevision = $state(0);
  let visible = $state(true);
  let outerElement = $state<Element | null>();
  let innerElement = $state<Element | null>();
  const attachmentKey = createAttachmentKey();
  const authored = () => {
    const revision = authoredRevision;
    events.push(`authored attach ${revision}`);
    return () => {
      events.push(`authored cleanup ${revision}`);
    };
  };
  const outerRef = (node: Element | null) => {
    if (!node) throw new Error('A cleanup-returning ref must use its returned cleanup.');
    events.push('outer attach');
    return () => {
      events.push('outer cleanup');
    };
  };
  const innerRef = $derived.by(() => {
    const revision = innerRevision;
    return (node: Element | null) => {
      if (!node) throw new Error('A cleanup-returning ref must use its returned cleanup.');
      events.push(`inner attach ${revision}`);
      return () => {
        events.push(`inner cleanup ${revision}`);
      };
    };
  });
  export function updateInner() {
    innerRevision += 1;
  }
  export function updateAuthored() {
    authoredRevision += 1;
  }
  export function hide() {
    visible = false;
  }
  export function getElements() {
    return [outerElement, innerElement];
  }
</script>
{#if visible}
  <RenderElement
    tag="button"
    params={{ ref: [outerRef], props: { [attachmentKey]: authored } }}
    componentProps={{ render: nested }}
    bind:element={outerElement}
  />
{/if}
{#snippet nested(props: HTMLProps)}
  <RenderElement
    tag="button"
    params={{ ref: [innerRef], props: props }}
    bind:element={innerElement}
  />
{/snippet}
