<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import { Form } from '../../src/lib/form/index.js';
  import { Checkbox } from '../../src/lib/checkbox/index.js';
  import { Switch } from '../../src/lib/switch/index.js';
  import { untrack } from 'svelte';
  let {
    family = 'checkbox',
    mode = 'source',
    initial = false,
    ownerInitial,
    controlled = false,
    cancel = false,
  }: {
    family?: 'checkbox' | 'switch';
    mode?: 'source' | 'native-prop' | 'native-bind';
    initial?: boolean;
    ownerInitial?: boolean;
    controlled?: boolean;
    cancel?: boolean;
  } = $props();
  let checked = $state(untrack(() => ownerInitial ?? initial));
  let calls = $state<boolean[]>([]);
  let values = $state<unknown>();
  const getChecked = () => checked;
  const setChecked = (next: boolean) => {
    if (!controlled) checked = next;
  };
  export function ownerSet(next: boolean) {
    checked = next;
  }
  export function authoredDefault(next: boolean) {
    initial = next;
  }
  const onCheckedChange = (next: boolean, details: { cancel(): void }) => {
    calls.push(next);
    if (cancel) details.cancel();
  };
</script>

<Form
  onFormSubmit={(next) => {
    values = next;
  }}
>
  <Field.Root name="enabled" data-field>
    {#if mode === 'source'}
      {#if family === 'switch'}
        <Switch.Root
          checked={controlled ? checked : undefined}
          defaultChecked={initial}
          {onCheckedChange}
          value="yes"
        />
      {:else}
        <Checkbox.Root
          checked={controlled ? checked : undefined}
          defaultChecked={initial}
          {onCheckedChange}
          value="yes"
        />
      {/if}
    {:else if mode === 'native-prop'}
      <input
        type="checkbox"
        name="enabled"
        value="yes"
        defaultChecked={initial}
        {checked}
        onclick={(event) => {
          if (cancel) event.preventDefault();
          else setChecked(event.currentTarget.checked);
        }}
      />
    {:else}
      <input
        type="checkbox"
        name="enabled"
        value="yes"
        defaultChecked={initial}
        bind:checked={getChecked, setChecked}
        onclick={(event) => {
          if (cancel) event.preventDefault();
        }}
      />
    {/if}
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
<output data-owner>{String(checked)}</output>
<output data-calls>{JSON.stringify(calls)}</output>
<output data-values>{JSON.stringify(values)}</output>
