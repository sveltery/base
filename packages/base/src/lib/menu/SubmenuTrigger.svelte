<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';

  // Original submenu-trigger renderer composition (MIT).
  import { triggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { createMenuSubmenuTrigger } from './submenu-trigger/createMenuSubmenuTrigger.svelte.js';
  import type { MenuSubmenuTriggerProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { ref = $bindable(null), ...props }: MenuSubmenuTriggerProps = $props();
  const generatedId = $props.id();
  const root = createMenuSubmenuTrigger(
    () => props,
    generatedId,
    (node) => {
      ref = node;
    },
  );

  const renderSnippet = $derived(props.render);
  const mergedProps = $derived({
    ...mergeComponentProps(
      root.state,
      { class: props.class, style: props.style },
      root.props,
      triggerOpenStateMapping,
    ),
  });
</script>

{#if renderSnippet}
  {@render renderSnippet(mergedProps, root.state, props.children)}
{:else}
  <div {...mergedProps}>{@render props.children?.()}</div>
{/if}
