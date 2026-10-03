<script lang="ts">
  // Native standalone source-contract supplement. MIT: parity/radio/UPSTREAM_LICENSE.
  import { Field } from '../../src/lib/field/index.js';
  import { Radio } from '../../src/lib/radio/index.js';
  let { value }: { value: string } = $props();
</script>
<Field.Root id="standalone-field">
  <Radio.Root {value} id="standalone-input" data-testid="standalone-radio">Standalone</Radio.Root>
</Field.Root>
