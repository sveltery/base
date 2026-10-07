<script lang="ts">
  import { untrack } from 'svelte';
  import { useFormContext } from '../../src/lib/internals/form-context/FormContext.js';
  import { useFieldRootContext } from '../../src/lib/internals/field-root-context/FieldRootContext.js';
  import { useLabelableContext } from '../../src/lib/internals/labelable-provider/LabelableContext.js';
  let {
    capture,
  }: {
    capture: (contexts: {
      form: ReturnType<typeof useFormContext>;
      field: ReturnType<typeof useFieldRootContext>;
      labelable: ReturnType<typeof useLabelableContext>;
    }) => void;
  } = $props();
  const contexts = {
    form: useFormContext(),
    field: useFieldRootContext(false),
    labelable: useLabelableContext(),
  };
  untrack(() => capture(contexts));
</script>
