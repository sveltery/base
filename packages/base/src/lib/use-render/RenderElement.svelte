<script lang="ts" generics="State extends Record<string, unknown>, Host extends Element = Element">
  // Private call-shape adapter; shared source closure lives in internals/useRenderElement.ts (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import type { RenderElementProps } from './types.js';
  let {
    defaultTagName,
    element = $bindable(),
    children,
    ...parameters
  }: RenderElementProps<State, Host> = $props();
</script>

<RenderElement
  tag={defaultTagName ?? 'div'}
  componentProps={parameters}
  params={parameters}
  {children}
  bind:element
/>
