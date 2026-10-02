<script lang="ts">
  // describeConformance helper adaptations at immutable Base UI v1.8.0 (MIT).
  import { type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { Avatar, type AvatarRootState } from '../../src/lib/avatar/index.js';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  let { part = 'Root', mode = 'default', lang, foobar, style, ownStyle, componentClass, renderClass, value }: {
    part?: 'Root' | 'Image' | 'Fallback'; mode?: 'default' | 'function' | 'element'; lang?: string; foobar?: string;
    style?: string; ownStyle?: string; componentClass?: string | ((state: AvatarRootState) => string); renderClass?: string; value?: string;
  } = $props();
  let ref = $state<HTMLElement | null>();
  let renderRef = $state<HTMLElement | null>();
  let tag = $state('div');
  let mounted = $state(true);
  export function refs() { return [ref, renderRef]; }
  export function replace() { tag = 'section'; }
  export function remove() { mounted = false; }
</script>
{#snippet replacementFunction(props: Record<string | symbol, unknown>, _state: AvatarRootState, children: Snippet | undefined)}
  <div data-testid="base-ui-wrapper">
    <svelte:element this={tag} {...mergeProps(props, { class: renderClass, ...(ownStyle ? { style: ownStyle } : {}) }) as HTMLAttributes<HTMLElement>} data-testid="wrapped" data-test-value={value} bind:this={renderRef}>{@render children?.()}</svelte:element>
  </div>
{/snippet}
{#snippet replacementElement(props: Record<string | symbol, unknown>, state: AvatarRootState, children: Snippet | undefined)}
  {@render replacementFunction(props, state, children)}
{/snippet}
{#if mounted}
  {#if part === 'Root'}
    <Avatar.Root data-testid="default" {lang} data-foobar={foobar} {style} class={componentClass} bind:ref render={mode === 'function' ? replacementFunction : mode === 'element' ? replacementElement : undefined}>Child</Avatar.Root>
  {:else}
    <Avatar.Root>
      {#if part === 'Image'}
        <Avatar.Image src="test.png" data-testid="default" {lang} data-foobar={foobar} {style} class={componentClass} bind:ref render={mode === 'function' ? replacementFunction : mode === 'element' ? replacementElement : undefined} />
      {:else}
        <Avatar.Fallback data-testid="default" {lang} data-foobar={foobar} {style} class={componentClass} bind:ref render={mode === 'function' ? replacementFunction : mode === 'element' ? replacementElement : undefined}>Child</Avatar.Fallback>
      {/if}
    </Avatar.Root>
  {/if}
{/if}
