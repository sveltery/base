<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import Input from '../../src/lib/input/Input.svelte';
  let present = $state(false);
  let name = $state('first');
  let invalid = $state<boolean | undefined>();
  let input = $state<HTMLElement | null>();
  const submitted: Record<string, unknown>[] = [];
  export function show() {
    present = true;
  }
  export function hide() {
    present = false;
  }
  export function rename(value: string) {
    name = value;
  }
  export function setInvalid(value: boolean | undefined) {
    invalid = value;
  }
  export function snapshot() {
    return { input, submitted };
  }
</script>

<Form
  id="native-late-form"
  onFormSubmit={(values) => {
    submitted.push(values);
  }}
>
  <Field.Root
    {name}
    {invalid}
    validationMode="onChange"
    validate={(value) => (value === 'blocked' ? 'Blocked value' : null)}
  >
    <Field.Label id="native-late-label">Late control</Field.Label>
    {#if present}<Input id="native-late-control" defaultValue="seed" bind:ref={input} />{/if}
    <Field.Error id="native-late-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
