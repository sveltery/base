<script lang="ts">
  // Base UI v1.8.0 ToolbarSeparator: thin real Separator wrapper. MIT: THIRD_PARTY_NOTICES.md.
  import Separator from '../../separator/Separator.svelte';
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import type { ToolbarSeparatorProps } from '../types.js';
  let { ref = $bindable(), ...props }: ToolbarSeparatorProps = $props();
  const toolbar = useToolbarRootContext();
  const orientation = $derived(toolbar.orientation === 'vertical' ? 'horizontal' : 'vertical');
</script>
<Separator {orientation} {...props} bind:ref />
