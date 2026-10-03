<script lang="ts">
  // Public-package native standalone source-contract supplement. MIT.
  import { Field } from '@sveltery/base/field';
  import { Radio } from '@sveltery/base/radio';
  let { value }: { value: string } = $props();
</script>
<Field.Root id="standalone-field">
  <Radio.Root {value} id="standalone-input" data-testid="standalone-radio">Standalone</Radio.Root>
</Field.Root>
