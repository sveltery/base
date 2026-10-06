<script lang="ts">
  import { untrack } from 'svelte';
  import { useFieldRootContext } from '../../src/lib/internals/field-root-context/FieldRootContext.js';
  import type { UseFieldValidationReturnValue } from '../../src/lib/field/root/useFieldValidation.svelte.js';
  let { capture }: { capture: (validation: UseFieldValidationReturnValue) => void } = $props();
  const validation = useFieldRootContext(false).validation;
  untrack(() => capture(validation));
</script>
