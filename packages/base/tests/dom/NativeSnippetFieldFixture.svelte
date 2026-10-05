<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import Input from '../../src/lib/input/Input.svelte';
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  import type { FieldRootState } from '../../src/lib/field/types.js';
  let field = $state<HTMLElement | null>();
  let control = $state<HTMLElement | null>();
  let label = $state<HTMLElement | null>();
  let description = $state<HTMLElement | null>();
  let value = $state('seed');
  let present = $state(true);
  const calls: string[] = [];
  const submitted: Record<string, unknown>[] = [];
  export function snapshot() {
    return { field, control, label, description, value, calls, submitted };
  }
  export function hide() {
    present = false;
  }
</script>

{#snippet rootHost(
  props: HTMLProps,
  state: FieldRootState,
  children: Snippet | undefined,
)}
  <section
    {...mergeProps(props, {
      class: 'owned-field',
    }) as HTMLAttributes<HTMLElement>}
    data-valid={String(state.valid)}
  >
    {@render children?.()}
  </section>
{/snippet}
{#snippet inputHost(
  props: HTMLProps,
  state: FieldRootState,
  _children: Snippet | undefined,
)}
  <input
    {...mergeProps(props, {
      class: 'owned-input',
      style: 'color:blue',
    }) as HTMLInputAttributes}
    data-filled={state.filled ? '' : undefined}
  />
{/snippet}
<Form id="native-form" onFormSubmit={(values) => submitted.push(values)}>
  {#if present}
    <Field.Root
      name="email"
      id="native-field"
      render={rootHost}
      bind:ref={field}
    >
      <Field.Label id="native-label" bind:ref={label}>Email</Field.Label>
      <Input
        id="native-input"
        render={inputHost}
        bind:ref={control}
        {value}
        class={(state) => (state.filled ? 'filled-input' : 'empty-input')}
        style="color:red;padding:10px"
        oninput={() => calls.push('consumer')}
        onValueChange={(next) => {
          calls.push('value');
          value = next;
        }}
      />
      <Field.Description id="native-description" bind:ref={description}
        >Use your email</Field.Description
      >
    </Field.Root>
  {/if}
  <button type="submit">Submit</button>
</Form>
