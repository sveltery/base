<script lang="ts">
  import { NumberField } from '../../src/lib/number-field/index.js';
  let {
    onChange,
    onCommit,
  }: {
    onChange: (value: number | null, details: { cancel: () => void }) => void;
    onCommit: (value: number | null) => void;
  } = $props();
</script>

<NumberField.Root defaultValue={0} onValueChange={onChange} onValueCommitted={onCommit}>
  <NumberField.Increment />
  <NumberField.Input />
</NumberField.Root>
