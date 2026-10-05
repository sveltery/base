<script lang="ts">
  import { Field as Source, type TypedField } from './imports.js';
  import CompilerRoot from './TypedRoot.svelte';
  import { tree } from './forms.js';
  function namespace<Fields extends object>(): TypedField<Fields> {
    return { ...Source, Root: CompilerRoot };
  }
  const Field = namespace<typeof tree.fields>();
</script>

<Field.Root name="label" as="text" />
<Field.Root name="children[0].label" as="password" />
<Field.Root name="children[0].children[1].count" as="number" />
<Field.Root name="children[0].children[1].active" as="checkbox" />
<Field.Root name="children[0].value" as="text" />
<Field.Root name="children[0].issues" as="number" />
<Field.Root
  name="children[0].children[1].children[2].children[3].children[4].children[5].children[6].children[7].children[8].children[9].label"
  as="text"
/>
<Field.Root name="children[0].label"
  ><Field.Control {...tree.fields.children[0].label.as('text')} /></Field.Root
>
