<script lang="ts">
  import { Form } from '@sveltery/base';
  import type { RemoteForm } from '@sveltejs/kit';
  let {
    remote,
  }: {
    remote: RemoteForm<{ text: string; age: number; enabled: boolean; choices: string[] }, unknown>;
  } = $props();
</script>

<Form {remote}>
  {#snippet children(Field)}
    <!-- reject: nonexistent logical name -->
    <Field.Root name="missing" as="text" />
    <!-- reject: text accessor number kind -->
    <Field.Root name="text" as="number" />
    <!-- reject: numeric accessor text kind -->
    <Field.Root name="age" as="text" />
    <!-- reject: scalar boolean option type -->
    <Field.Root name="enabled" as="checkbox" value="on" />
    <!-- reject: radio option is required -->
    <Field.Root name="text" as="radio" />
    <!-- reject: malformed array index -->
    <Field.Root name="choices[-1]" as="text" />
    <!-- reject: array accessor scalar boolean default -->
    <Field.Root name="choices" as="checkbox" value={false} />
  {/snippet}
</Form>
