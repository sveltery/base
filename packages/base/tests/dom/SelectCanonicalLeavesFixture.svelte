<script lang="ts">
  import { createAttachmentKey } from 'svelte/attachments';
  import type { Snippet } from 'svelte';
  import ListboxSeparator from '../../src/lib/utils/listbox-separator/ListboxSeparator.svelte';
  import type { ListboxSeparatorState } from '../../src/lib/utils/listbox-separator/types.js';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import { resolveMultipleLabels } from '../../src/lib/internals/resolveValueLabel.js';

  let {
    custom = false,
    attached,
  }: {
    custom?: boolean;
    attached?: (node: HTMLElement) => (() => void) | void;
  } = $props();
  let orientation = $state<ListboxSeparatorState['orientation']>('horizontal');
  let visible = $state(true);
  let override = $state(false);
  let ref = $state<HTMLElement | null>();
  let replacementRef = $state<HTMLElement | null>(null);
  let tag = $state('section');
  const attachment = createAttachmentKey();
  const attachments = { [attachment]: (node: HTMLElement) => attached?.(node) };
  export function setOrientation(value: ListboxSeparatorState['orientation']) {
    orientation = value;
  }
  export function setOverride(value: boolean) {
    override = value;
  }
  export function replaceHost() {
    tag = 'article';
  }
  export function remove() {
    visible = false;
  }
  export function getRefs() {
    return [ref, replacementRef];
  }
</script>

{#snippet label()}<strong data-testid="snippet-label">Authored</strong>{/snippet}
{const labels = $derived(
  resolveMultipleLabels(['markup', 'disabled', 'zero', 'big'], {
    markup: label,
    disabled: false,
    zero: 0,
    big: 2n,
  }),
)}
<span data-testid="resolved-labels"
  >{#each labels as value, index (index)}{#if typeof value === 'function'}{@render value()}{:else}{value}{/if}{/each}</span
>
<span data-testid="native-labels">{@render label()}, {false}, {0}, {2n}</span>

{#snippet replacement(
  props: Record<string | symbol, unknown>,
  state: ListboxSeparatorState,
  children: Snippet | undefined,
)}
  <svelte:element
    this={tag}
    {...mergeProps(props, { class: 'replacement' })}
    data-render-state={state.orientation}
    bind:this={replacementRef}>{@render children?.()}</svelte:element
  >
{/snippet}

{#if visible}
  <ListboxSeparator
    {orientation}
    bind:ref
    render={custom ? replacement : undefined}
    {...attachments}
    {...override
      ? {
          role: 'separator' as const,
          'aria-orientation': 'vertical' as const,
          'data-orientation': 'consumer',
        }
      : {}}
    class={(state) => ['separator', { vertical: state.orientation === 'vertical' }]}
    style={(state) => `color:${state.orientation === 'vertical' ? 'red' : 'green'}`}
    data-testid="listbox-separator">Child</ListboxSeparator
  >
{/if}
