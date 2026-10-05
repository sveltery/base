<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import UseRender from '../../../../packages/base/src/lib/use-render/UseRender.svelte';
  import RenderElement from '../../../../packages/base/src/lib/use-render/RenderElement.svelte';
  import { createUseRenderCase, publicCases, type State } from './use-render-cases.js';
  import type {
    UseRenderProps,
    UseRenderHostProps,
  } from '../../../../packages/base/src/lib/use-render/types.js';
  let { scenario }: { scenario: string } = $props();
  const controller = untrack(() => createUseRenderCase(scenario));
  let stage = $state(0),
    hydrated = $state(false),
    element = $state<Element | null | undefined>();
  const config = $derived(controller.configuration(stage));
  const internal = $derived(
    !publicCases.includes(scenario) &&
      !scenario.startsWith('ref-update-') &&
      !scenario.startsWith('ref-observation-') &&
      !scenario.startsWith('ref-outer-'),
  );
  const options = $derived({
    ...config.options,
    render:
      config.outer === 'span'
        ? outerSpan
        : config.outer === 'section'
          ? outerSection
          : config.outer === 'same-span'
            ? outerSameSpan
            : config.replacement
              ? replacement
              : undefined,
  });
  const ownKey = createAttachmentKey();
  function attachOwn(node: Element) {
    const ref = config.ownRef;
    if (!ref) return;
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      return () => {
        if (cleanup) cleanup();
        else ref(null);
      };
    }
    ref.current = node;
    return () => {
      ref.current = null;
    };
  }
  onMount(() => {
    hydrated = true;
  });
  function probe(node: HTMLElement) {
    Object.assign(node, {
      renderProbe: () => ({
        calls: controller.calls,
        renders: controller.renders,
        refs: controller.refs.map((ref) =>
          ref.current
            ? { tag: ref.current.tagName, id: ref.current.id, connected: ref.current.isConnected }
            : null,
        ),
        publicRefs:
          scenario === 'public-refs'
            ? (config.options.ref as { current: Element | null }[]).map((ref) =>
                ref.current
                  ? {
                      tag: ref.current.tagName,
                      id: ref.current.id,
                      connected: ref.current.isConnected,
                    }
                  : null,
              )
            : undefined,
        element: element
          ? { tag: element.tagName, id: element.id, connected: element.isConnected }
          : null,
      }),
    });
  }
</script>

{#snippet outerSpan(
  supplied: UseRenderHostProps,
  _state: State,
  children: Snippet | undefined,
)}<span {...supplied as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet outerSection(
  supplied: UseRenderHostProps,
  _state: State,
  children: Snippet | undefined,
)}<section {...supplied as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>{/snippet}
{#snippet outerSameSpan(
  supplied: UseRenderHostProps,
  _state: State,
  children: Snippet | undefined,
)}<span {...supplied as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet replacement(supplied: UseRenderHostProps, state: State, children: Snippet | undefined)}
  {const merged = $derived(mergeProps(supplied, config.owned))}
  {const style = $derived(
    config.owned.style ? `${supplied.style ?? ''};${config.owned.style}` : supplied.style,
  )}
  {const rendered = $derived(controller.observe(supplied, state))}
  <svelte:element
    this={config.tag}
    {...merged}
    {style}
    data-observed={rendered}
    {...{ [ownKey]: attachOwn }}>{@render children?.()}</svelte:element
  >
{/snippet}
<main data-hydrated={hydrated} {@attach probe}>
  <button
    type="button"
    onclick={() => {
      stage += 1;
    }}>Advance</button
  >
  {#if scenario === 'ref-observation-unmount'}
    {#if stage === 0}<UseRender {...options as UseRenderProps} enabled={true} bind:element />{/if}
  {:else if internal}<RenderElement {...options} bind:element />{:else}<UseRender
      {...options as UseRenderProps}
      bind:element
    />{/if}
</main>
