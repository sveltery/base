<script lang="ts">
  import { untrack, type ComponentProps } from 'svelte';
  import { Form } from '../../src/lib/form/index.js';
  import { Field } from '../../src/lib/field/index.js';
  import type { FieldRootActions, FieldRootProps } from '../../src/lib/field/types.js';
  import Probe from './FieldFormInvocationCaptureProbe.svelte';
  let {
    validate,
    actionsRef,
    capture,
    submit,
    initialInvalid = false,
  }: {
    validate: FieldRootProps['validate'];
    actionsRef: { current: FieldRootActions | null };
    capture: ComponentProps<typeof Probe>['capture'];
    submit: () => void;
    initialInvalid?: boolean;
  } = $props();
  let invalid = $state(untrack(() => initialInvalid));
  let id = $state('before');
  let labelId = $state('label-before');
  let shown = $state(true);
  let generation = $state(0);
  export function update(nextInvalid: boolean, nextId: string, nextLabel = labelId) {
    invalid = nextInvalid;
    id = nextId;
    labelId = nextLabel;
  }
  export function replace() {
    generation += 1;
  }
  export function remove() {
    shown = false;
  }
</script>

<Form onFormSubmit={submit}>
  <Field.Root name="email" {invalid} {validate} {actionsRef}>
    <Field.Label id={labelId}>Email</Field.Label>
    {#key generation}{#if shown}<Field.Control {id} defaultValue="seed" />{/if}{/key}
    <Field.Validity
      >{#snippet children(state)}<output
          >{JSON.stringify({ valid: state.validity.valid, error: state.error })}</output
        >{/snippet}</Field.Validity
    >
    <Probe {capture} />
  </Field.Root>
</Form>
