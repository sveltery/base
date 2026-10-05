<script lang="ts" generics="State extends object = Record<string, never>">
  // Actual FloatingPortal host subtree; native mount preserves destination/context ownership.
  // Base UI v1.8.0 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c, MIT.
  import { createAttachmentKey, type Attachment } from 'svelte/attachments';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import type { BaseUIComponentProps, HTMLProps } from '../../internals/types.js';
  let { render, class: className, style, attributes, onHost }: BaseUIComponentProps<State> & {
    attributes: HTMLProps;
    onHost: Attachment<HTMLElement>;
  } = $props();
  const hostAttachmentKey = createAttachmentKey();
  const state = {} as State;
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: className, style }, attributes),
    [hostAttachmentKey]: onHost,
  });
</script>
{#if render}
  {@render render(mergedProps, state, undefined)}
{:else}
  <div {...mergedProps}></div>
{/if}
