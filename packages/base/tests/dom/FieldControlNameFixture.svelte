<script lang="ts">
  import { untrack } from 'svelte';
  import { Field, Form } from '../../src/lib/index.js';
  import { setFieldControlNameContext } from '../../src/lib/internals/field-control-name/FieldControlNameContext.js';
  let { provided = false }: { provided?: boolean } = $props();
  let nativeName = $state<string | undefined>('serialized');
  let values = $state<Record<string, unknown>>({});
  if (untrack(() => provided))
    setFieldControlNameContext({
      get name() {
        return nativeName;
      },
    });
  export function rename(name: string | undefined) {
    nativeName = name;
  }
</script>

<Form
  errors={{ logical: 'server error' }}
  onFormSubmit={(next) => {
    values = next;
  }}
>
  <Field.Root name="logical">
    <Field.Label>Control</Field.Label>
    <Field.Control name="authored" defaultValue="seed" />
    <Field.Error />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
<output>{JSON.stringify(values)}</output>
