<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  import type { Snippet } from 'svelte';
  import Button from '../../src/lib/button/Button.svelte';
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  let outer = $state<HTMLElement | null>();
  let inner = $state<HTMLElement | null>();
  let revision = $state(0);
  let present = $state(true);
  const calls: string[] = [];
  const outerKey = createAttachmentKey();
  const innerKey = createAttachmentKey();
  function outerAttachment(host: HTMLElement) {
    calls.push(`outer:${host.tagName}`);
    return () => calls.push(`outer-cleanup:${host.isConnected}`);
  }
  function innerAttachment(host: HTMLElement) {
    const current = revision;
    calls.push(`inner:${current}:${host.tagName}`);
    return () => calls.push(`inner-cleanup:${current}:${host.isConnected}`);
  }
  export function updateInner() {
    revision += 1;
  }
  export function hide() {
    present = false;
  }
  export function snapshot() {
    return { outer, inner, calls };
  }
</script>

{#snippet nested(props: HTMLProps, _state: { disabled: boolean }, children: Snippet | undefined)}
  <Button {...props} bind:ref={inner} {...{ [innerKey]: innerAttachment }}
    >{@render children?.()}</Button
  >
{/snippet}
{#if present}<Button bind:ref={outer} render={nested} {...{ [outerKey]: outerAttachment }}
    >Nested children</Button
  >{/if}
