<script lang="ts">
  // Original MenuGroup label/provider/render composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { provideMenuGroupContext, type MenuGroupContext } from './group/MenuGroupContext.js';
  import type { MenuGroupProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuGroupProps = $props();
  let labelId = $state<string | undefined>(undefined);
  const setLabelId: MenuGroupContext = (value) => {
    labelId = typeof value === 'function' ? value(labelId) : value;
  };
  provideMenuGroupContext(setLabelId);
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{ props: { role: 'group', 'aria-labelledby': labelId, ...elementProps } }}
  bind:element={ref}
  {children}
/>
