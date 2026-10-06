<script lang="ts">
  import { Field } from '../../src/lib/field/index.js';
  import type { FieldRootActions, FieldRootProps } from '../../src/lib/field/types.js';
  let {
    validate,
    actionsRef,
  }: { validate: FieldRootProps['validate']; actionsRef: { current: FieldRootActions | null } } =
    $props();
  let shown = $state(false);
  let invalid = $state(false);
  let controlId = $state('control-before');
  let replacement = $state<FieldRootProps['validate']>();
  export function update(
    nextInvalid: boolean,
    nextId: string,
    nextValidate?: FieldRootProps['validate'],
  ) {
    invalid = nextInvalid;
    controlId = nextId;
    replacement = nextValidate;
  }
</script>

<button onclick={() => (shown = true)}>Mount control</button>
<Field.Root validate={replacement ?? validate} {actionsRef} {invalid}>
  {#if shown}<Field.Control id={controlId} defaultValue="first baseline" />{/if}
  <Field.Validity
    >{#snippet children(state)}<output>{JSON.stringify(state.initialValue)}</output><output
        class="verdict"
        >{JSON.stringify({ valid: state.validity.valid, error: state.error })}</output
      >{/snippet}</Field.Validity
  >
</Field.Root>
