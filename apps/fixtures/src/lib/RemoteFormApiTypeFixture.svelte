<script lang="ts">
  import { Form, Switch } from '@sveltery/base';
  import type { RemoteForm } from '@sveltejs/kit';
  let {
    remote,
  }: {
    remote: RemoteForm<
      { storageType: string; enabled: boolean; age: number; options: string[]; files: File[] },
      unknown
    >;
  } = $props();
</script>

<Form {remote}>
  {#snippet children(Field)}
    <Field.Root name="storageType" as="text">
      <Field.Label>Storage type</Field.Label>
      <Field.Control autocomplete="organization" oninput={(event) => event.currentTarget.focus()}>
        {#snippet render(props)}<textarea {...props}></textarea>{/snippet}
      </Field.Control><Field.Error />
    </Field.Root>
    <Field.Root name="enabled" as="checkbox">
      <Field.Label>Enabled</Field.Label>
      <Field.Control>
        {#snippet render(props)}
          <Switch.Root {...props}><Switch.Thumb /></Switch.Root>
        {/snippet}
      </Field.Control>
      <Field.Error />
    </Field.Root>
    <Field.Root name="age" as="number" value={0}>
      <Field.Control autocomplete="off" oninput={(event) => event.currentTarget.focus()}>
        {#snippet render(props)}<input {...props} />{/snippet}
      </Field.Control>
    </Field.Root>
    <Field.Root name="options" as="select multiple">
      <Field.Control>
        {#snippet render(props)}<select {...props}
            ><option value="a">A</option><option value="b">B</option></select
          >{/snippet}
      </Field.Control>
    </Field.Root>
    <Field.Root name="files" as="file multiple">
      <Field.Control>{#snippet render(props)}<input {...props} />{/snippet}</Field.Control>
    </Field.Root>
  {/snippet}
</Form>
