<script lang="ts">
  import { Field as Source, type TypedField } from './imports.js';
  import CompilerRoot from './TypedRoot.svelte';
  import { tree } from './forms.js';
  function namespace<Fields extends object>(): TypedField<Fields> {
    return { ...Source, Root: CompilerRoot };
  }
  const Field = namespace<typeof tree.fields>();
</script>

<!-- reject: recursive-typo -->
<Field.Root name="children[0].children[1].typo" as="text" />
<!-- reject: recursive-wrong-as -->
<Field.Root name="children[0].children[1].label" as="number" />
<!-- reject: recursive-missing-option -->
<Field.Root name="children[0].label" as="radio" />
<!-- reject: recursive-wrong-hidden-value -->
<Field.Root name="children[0].count" as="hidden" value="42" />
<!-- reject: recursive-wrong-boolean-value -->
<Field.Root name="children[0].active" as="hidden" value={42} />
<!-- reject: recursive-container -->
<Field.Root name="children[0].children" as="text" />
<!-- reject: recursive-wrong-array-syntax -->
<Field.Root name="children.0.label" as="text" />
<!-- reject: recursive-helper-method -->
<Field.Root name="children[0].set" as="text" />
<!-- reject: recursive-missing-dot -->
<Field.Root name="children[0].children[1]label" as="text" />
<!-- reject: recursive-empty-interior-segment -->
<Field.Root name="children[0]..label" as="text" />
<!-- reject: recursive-empty-trailing-segment -->
<Field.Root name="children[0].label." as="text" />
<!-- reject: recursive-negative-index -->
<Field.Root name="children[0].children[-1].label" as="text" />
<!-- reject: recursive-exponent-index -->
<Field.Root name="children[0].children[1e2].label" as="text" />
<!-- reject: recursive-signed-index -->
<Field.Root name="children[0].children[+1].label" as="text" />
<!-- reject: recursive-decimal-index -->
<Field.Root name="children[0].children[1.5].label" as="text" />
<!-- reject: recursive-hex-index -->
<Field.Root name="children[0].children[0x1].label" as="text" />
<!-- reject: recursive-space-index -->
<Field.Root name="children[0].children[ 1 ].label" as="text" />
