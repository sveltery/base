<script lang="ts">
  import { setFieldControlNameContext } from '../../src/lib/internals/field-control-name/FieldControlNameContext.js';
  import Fixture from './BooleanFieldFixture.svelte';
  import type { FormValues } from '../../src/lib/form/types.js';
  let {
    family,
    submit,
  }: { family: 'switch' | 'checkbox'; submit: (values: FormValues) => void } = $props();
  let name = $state<string | undefined>('b:enabled');
  setFieldControlNameContext({
    get name() {
      return name;
    },
  });
  export function setNativeName(value: string | undefined) {
    name = value;
  }
</script>
<Fixture {family} {submit} rootProps={{ value: 'true', uncheckedValue: 'false' }} errors={{ enabled: 'logical error' }} />
