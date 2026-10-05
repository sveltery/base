<script lang="ts">
  // Source-ordered Base UI v1.8.0 ToolbarGroup.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import { setToolbarGroupContext } from './ToolbarGroupContext.js';
  import type { ToolbarGroupProps, ToolbarGroupState } from '../types.js';
  let { class: classProp, disabled: disabledProp = false, render, style, children, ref = $bindable(), ...elementProps }: ToolbarGroupProps = $props();
  const toolbar = useToolbarRootContext();
  const disabled = $derived(toolbar.disabled || disabledProp);
  setToolbarGroupContext({ get disabled() { return disabled; } });
  const state: ToolbarGroupState = $derived({ disabled, orientation: toolbar.orientation });
  const forwardedRef = {
    get current() { return ref ?? null; },
    set current(element: HTMLElement | null) { ref = element; },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state, ref: forwardedRef, props: [{ role: 'group' }, elementProps] });
</script>
<RenderElement tag="div" {componentProps} {params} {children} />
