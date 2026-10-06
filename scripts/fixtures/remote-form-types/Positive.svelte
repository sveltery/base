<script lang="ts">
  import { Field, type TypedField } from './imports.js';
  import {
    survey,
    other,
    transformed,
    matrix,
    blocked,
    uncertainName,
    stringName,
    correlated,
  } from './forms.js';
  import CompilerRoot from './TypedRoot.svelte';
  function namespace<Fields extends object>(): TypedField<Fields> {
    return { ...Field, Root: CompilerRoot };
  }
  const Root = namespace<typeof survey.fields>().Root;
  const Other = namespace<typeof other.fields>().Root;
  const Transformed = namespace<typeof transformed.fields>().Root;
  const Typed = namespace<typeof survey.fields>();
  const Matrix = namespace<typeof matrix.fields>().Root;
  const Blocked = namespace<typeof blocked.fields>().Root;
</script>

<Root name="storageType" as="text"><Field.Control /></Root>
<Root name="storageType" as="radio" value="cloud" />
<Root name="size" as="number"><Field.Control min={0} /></Root>
<Root name="size" as={['hidden', 42]} />
<Root name="enabled" as="checkbox" />
<Root name="enabled" as="hidden" value={false} />
<Root name="tags" as="checkbox" value="svelte" />
<Root name="tags" as="select multiple" />
<Root name="tags[3]" as="text" />
<Root name="upload" as="file" />
<Root name="uploads" as="file multiple" />
<Root name="settings.label" as="password" />
<Root name="settings.quota" as="range" value={2} />
<Root name="rows[0].title" as="text" />
<Root name="rows[4].active" as="checkbox" />
<Root name="value" as="text" />
<Root name="issues" as="number" />
<Root name="as" as="checkbox" />
<Root name="set" as="text" />
<Root name="allIssues" as="text" />
<Root name="storageType"
  ><Field.Control {...survey.fields.storageType.as('text')} id="override" /></Root
>
<Other name="count" as="number" />
<Other name={uncertainName} />
<Other {...correlated} />
<Root name={stringName} as="text" />
<Matrix name="cells[0][1].label" as="text" />
<Matrix name="cells[00][12].label" as="text" />
<Matrix name="_key" as="text" />
<Matrix name="$key" as="text" />
<Matrix name="A1" as="text" />
<Blocked name="Constructor" as="text" />
<Blocked name="nested.constructorValue" as="text" />
<Blocked name="rows[0].prototypeValue" as="text" />
<Transformed name="quantity" as="text" />
<Typed.Root name="enabled" as="checkbox"
  ><Typed.Label>Enabled</Typed.Label><Typed.Control /><Typed.Error /></Typed.Root
>
<Field.Root name="external-library-name" invalid
  ><Field.Control id="external-control" value="manual" /></Field.Root
>
<Field.Root name="constructor"><Field.Control value="ordinary-native-field" /></Field.Root>
