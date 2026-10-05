<script lang="ts">
  // Source-ordered Base UI v1.8.0 ToolbarLink.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import CompositeItem from '../../internals/composite/item/CompositeItem.svelte';
  import type { ToolbarLinkProps, ToolbarLinkState } from '../types.js';
  const TOOLBAR_LINK_METADATA = { disabled: false, focusableWhenDisabled: true };
  let { class: classProp, render, style, children, ref = $bindable(), ...elementProps }: ToolbarLinkProps = $props();
  const toolbar = useToolbarRootContext();
  const state: ToolbarLinkState = $derived({ orientation: toolbar.orientation });
  const rendererProps = $derived([elementProps]);
</script>
<CompositeItem tag="a" {render} class={classProp} {style} metadata={TOOLBAR_LINK_METADATA} {state} bind:ref props={rendererProps} {children} />
