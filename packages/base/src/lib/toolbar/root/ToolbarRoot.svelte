<script lang="ts">
  // Source-ordered Base UI v1.8.0 ToolbarRoot.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import CompositeRoot from '../../internals/composite/root/CompositeRoot.svelte';
  import type { CompositeMetadata } from '../../internals/composite/list/CompositeListContext.js';
  import { setToolbarRootContext } from './ToolbarRootContext.js';
  import type { ToolbarRootProps, ToolbarRootState } from '../types.js';
  let {
    disabled = false, loopFocus, orientation = 'horizontal', class: classProp,
    render, style, children, ref = $bindable(), ...elementProps
  }: ToolbarRootProps = $props();
  let itemMap = $state.raw(new Map<Element, CompositeMetadata>());
  const disabledIndices = $derived.by(() => {
    const output: number[] = [];
    for (const itemMetadata of itemMap.values()) {
      if (itemMetadata.disabled && !itemMetadata.focusableWhenDisabled) output.push(itemMetadata.index);
    }
    return output;
  });
  setToolbarRootContext({
    get disabled() { return disabled; },
    get orientation() { return orientation; },
  });
  const rootState: ToolbarRootState = $derived({ disabled, orientation });
  const defaultProps = $derived({ 'aria-orientation': orientation, role: 'toolbar' });
  const rendererProps = $derived([defaultProps, elementProps]);
</script>
<CompositeRoot {render} class={classProp} {style} state={rootState} bind:ref props={rendererProps} {disabledIndices} {loopFocus} onMapChange={map => { itemMap = map; }} {orientation} {children} />
