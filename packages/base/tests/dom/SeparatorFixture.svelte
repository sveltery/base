<script lang="ts">
  import Separator from '../../src/lib/separator/Separator.svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import type { ClassValue } from 'svelte/elements';
  import type { SeparatorState } from '../../src/lib/separator/types.js';
  let { custom = false, attached, classValue }: { custom?: boolean; classValue?: ClassValue | ((state: SeparatorState) => ClassValue); attached?: (node: HTMLElement) => (() => void) | void } = $props();
  let orientation = $state<SeparatorState['orientation']>('horizontal');
  let mounted = $state(true);
  let ref = $state<HTMLElement | null>();
  let renderRef = $state<HTMLElement | null>(null);
  let override = $state(false);
  let tag = $state('section');
  const key = createAttachmentKey();
  const attachments = { [key]: (node: HTMLElement) => attached?.(node) };
  export function setOrientation(value: SeparatorState['orientation']) { orientation = value; }
  export function setOverride(value: boolean) { override = value; }
  export function replaceHost() { tag = 'article'; }
  export function remove() { mounted = false; }
  export function getRefs() { return [ref, renderRef]; }
</script>
{#snippet replacement(props: Record<string | symbol, unknown>, state: SeparatorState, children: import('svelte').Snippet | undefined)}
  <svelte:element this={tag} {...mergeProps(props, { class: 'replacement', onclick: () => {} })} data-render-state={state.orientation} bind:this={renderRef}>{@render children?.()}</svelte:element>
{/snippet}
{#if mounted}
  <Separator {orientation} bind:ref render={custom ? replacement : undefined} {...attachments}
    {...(override ? { role: 'presentation' as const, 'aria-orientation': 'vertical' as const, 'data-orientation': 'consumer' } : {})}
    class={classValue === undefined ? ((state: SeparatorState) => `separator-${state.orientation}`) : classValue} style={state => state.orientation === 'vertical' ? 'color: red' : 'color: green'} data-testid="separator">Child</Separator>
{/if}

<span data-testid="native-class" class={typeof classValue === 'function' ? classValue({ orientation }) : classValue}></span>
