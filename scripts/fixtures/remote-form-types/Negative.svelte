<script lang="ts">
  import { Field, type TypedField } from './imports.js';
  import { survey, other, transformed } from './forms.js';
  import CompilerRoot from './TypedRoot.svelte';
  function namespace<Fields extends object>(): TypedField<Fields> { return { ...Field, Root: CompilerRoot }; }
  const Root = namespace<typeof survey.fields>().Root;
  const Other = namespace<typeof other.fields>().Root;
  const Transformed = namespace<typeof transformed.fields>().Root;
</script>
<!-- reject: typo -->
<Root name="storageTyp" as="text" />
<!-- reject: wrong-control -->
<Root name="storageType" as="number" />
<!-- reject: boolean-radio -->
<Root name="enabled" as="radio" value="true" />
<!-- reject: wrong-hidden-value -->
<Root name="size" as="hidden" value="42" />
<!-- reject: missing-radio-option -->
<Root name="storageType" as="radio" />
<!-- reject: missing-checkbox-option -->
<Root name="tags" as="checkbox" />
<!-- reject: wrong-checkbox-option -->
<Root name="tags" as="checkbox" value={42} />
<!-- reject: file-value -->
<Root name="upload" as="file" value="x" />
<!-- reject: wrong-file-multiple -->
<Root name="uploads" as="file" />
<!-- reject: container -->
<Root name="settings" as="text" />
<!-- reject: nested-wrong-control -->
<Root name="settings.quota" as="text" />
<!-- reject: wrong-array-syntax -->
<Root name="rows.0.title" as="text" />
<!-- reject: wrong-array-leaf -->
<Root name="rows[0].active" as="number" />
<!-- reject: different-schema -->
<Other name="storageType" as="text" />
<!-- reject: helper-method -->
<Other name="value" as="text" />
<!-- reject: mixed-tuple-value -->
<Root name="size" as={['hidden', 42]} value={1} />
<!-- reject: manual-value -->
<Root name="size" value={42} />
<!-- reject: transformed-output-not-input -->
<Transformed name="quantity" as="number" />
