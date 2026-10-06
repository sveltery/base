<script lang="ts">
  import { Field, type TypedField } from './imports.js';
  import { survey, other, transformed, matrix, blocked, uncertainName } from './forms.js';
  import CompilerRoot from './TypedRoot.svelte';
  function namespace<Fields extends object>(): TypedField<Fields> {
    return { ...Field, Root: CompilerRoot };
  }
  const Root = namespace<typeof survey.fields>().Root;
  const Other = namespace<typeof other.fields>().Root;
  const Transformed = namespace<typeof transformed.fields>().Root;
  const Matrix = namespace<typeof matrix.fields>().Root;
  const Blocked = namespace<typeof blocked.fields>().Root;
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
<!-- reject: uncertain-name-control -->
<Other name={uncertainName} as="number" />
<!-- reject: uncertain-name-tuple -->
<Other name={uncertainName} as={['hidden', 42]} />
<!-- reject: uncertain-name-value -->
<Other name={uncertainName} as="hidden" value={42} />
<!-- reject: multidimensional-missing-dot -->
<Matrix name="cells[0][1]label" as="text" />
<!-- reject: multidimensional-bracket-suffix -->
<Matrix name="cells[0]x[1].label" as="text" />
<!-- reject: multidimensional-empty-index -->
<Matrix name="cells[][1].label" as="text" />
<!-- reject: invalid-identifier-hyphen -->
<Matrix name="bad-key" as="text" />
<!-- reject: invalid-identifier-dollar-suffix -->
<Matrix name="cash$amount" as="text" />
<!-- reject: blocked-root-proto -->
<Blocked name="__proto__" as="text" />
<!-- reject: blocked-root-prototype -->
<Blocked name="prototype" as="text" />
<!-- reject: blocked-ancestor-constructor -->
<Blocked name="constructor.label" as="text" />
<!-- reject: blocked-nested-proto -->
<Blocked name="nested.__proto__" as="text" />
<!-- reject: blocked-nested-constructor -->
<Blocked name="nested.constructor" as="text" />
<!-- reject: blocked-nested-prototype -->
<Blocked name="nested.prototype" as="text" />
<!-- reject: blocked-array-constructor -->
<Blocked name="rows[0].constructor" as="text" />
