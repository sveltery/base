<script lang="ts">
  // Base UI v1.8.0 FieldRoot wrapper; MIT: THIRD_PARTY_NOTICES.md.
  import LabelableProvider from '../internals/labelable-provider/LabelableProvider.svelte';
  import FieldRootInner from './root/FieldRootInner.svelte';
  import type { FieldRootProps } from './types.js';
  let { ref = $bindable(), ...componentProps }: FieldRootProps = $props();
</script>
<LabelableProvider>
  <FieldRootInner {...componentProps} bind:ref />
</LabelableProvider>
