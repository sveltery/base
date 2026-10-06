<script lang="ts">
  // Three conformance declarations are separate from 44 ordinary assertions.
  import { onMount } from 'svelte';
  import { Avatar, type AvatarRootState } from '@sveltery/base';
  import { mergeProps } from '@sveltery/base';
  import { avatarMockSource } from './avatar-harness.js';
  let { part = 'Root', mode = 'default' }: { part?: string; mode?: string } = $props();
  let ref = $state<HTMLElement | null>(),
    renderRef = $state<HTMLElement | null>(null),
    hydrated = $state(false);
  const Part = $derived(Avatar[part as 'Root' | 'Image' | 'Fallback']);
  const custom = $derived(!['default', 'style', 'class'].includes(mode));
  const classes = $derived(
    mode === 'class'
      ? 'test-class'
      : mode === 'merged-class'
        ? 'component-classname'
        : mode === 'resolved-class'
          ? () => 'conditional-component-classname'
          : undefined,
  );
  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet replacement(props: Record<string | symbol, unknown>, _state: AvatarRootState)}
  {const supplied = $derived(
    mergeProps(props, {
      ...(mode.includes('style') ? { style: 'color: green' } : {}),
      ...(mode.includes('class') ? { class: 'render-prop-classname' } : {}),
      ...(mode === 'wrapper-empty' ? {} : { 'data-test-value': 'test-value' }),
    }),
  )}
  {#if mode.startsWith('wrapper')}<div data-testid="wrapper"
      ><div {...supplied} bind:this={renderRef}></div></div
    >{:else}<div {...supplied} bind:this={renderRef}></div>{/if}
{/snippet}
{#snippet content()}
  <Part
    lang="fr"
    data-foobar="foobar"
    data-testid="conformance"
    bind:ref
    render={custom ? replacement : undefined}
    class={classes}
    style={mode === 'style' ? 'color: green' : undefined}
    {...part === 'Image' ? { src: avatarMockSource } : {}}
  />
{/snippet}
<main data-hydrated={hydrated}>
  {#if part === 'Root'}{@render content()}{:else}<Avatar.Root>{@render content()}</Avatar.Root>{/if}
  <output data-testid="ref">{ref?.tagName}</output><output data-testid="ref-id"
    >{ref?.getAttribute('data-testid')}</output
  >
  <output data-testid="render-ref">{renderRef?.tagName}</output><output data-testid="ref-identity"
    >{!!ref && ref === renderRef}</output
  >
</main>
