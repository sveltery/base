<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import { Input } from '../../src/lib/input/index.js';
  import type { FieldRootProps } from '../../src/lib/field/types.js';
  import type { UseFieldValidationReturnValue } from '../../src/lib/field/root/useFieldValidation.svelte.js';
  import Probe from './FieldValidationOwnerProbe.svelte';
  let {
    capture,
    validate,
    validationDebounceTime = 0,
  }: {
    capture: (validation: UseFieldValidationReturnValue) => void;
    validate: FieldRootProps['validate'];
    validationDebounceTime?: number;
  } = $props();
</script>

<Field.Root validationMode="onChange" {validate} {validationDebounceTime}>
  <Input />
  <Probe {capture} />
</Field.Root>
