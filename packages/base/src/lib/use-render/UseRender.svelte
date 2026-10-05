<script
  lang="ts"
  generics="State extends Record<string, unknown> = Record<string, unknown>, Host extends Element = Element"
>
  // Native component adaptation of mui/base-ui v1.8.0 useRender (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import type { UseRenderProps } from './types.js';
  let {
    defaultTagName,
    element = $bindable(),
    children,
    ...parameters
  }: UseRenderProps<State, Host> = $props();
</script>

<RenderElement
  tag={defaultTagName ?? 'div'}
  componentProps={parameters}
  params={parameters}
  {children}
  bind:element
/>
