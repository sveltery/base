<script lang="ts">
  // Base UI v1.8.0 NumberFieldGroup.tsx business composition (MIT).
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import type { NumberFieldGroupProps } from '../types.js';
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: NumberFieldGroupProps = $props();
  const context = useNumberFieldRootContext();
</script>
<RenderElement tag="div" componentProps={{ render, class: classProp, style }} params={{ state: context.state, props: [{ role: 'group' }, elementProps], stateAttributesMapping }} bind:element={ref}>{@render children?.()}</RenderElement>
