<script lang="ts">
  // Base UI v1.8.0 FieldValidity; MIT: THIRD_PARTY_NOTICES.md.
  import { getFieldContext } from './context.js';
  import { createFieldTransition } from './transition.svelte.js';
  import type { FieldValidityProps, FieldValidityState } from './types.js';
  let { children }: FieldValidityProps = $props();
  const field = getFieldContext(false)!;
  const transition = createFieldTransition(() => field.combinedValidityData.state.valid === false, () => field.input);
  const validityState: FieldValidityState = $derived({ ...field.combinedValidityData, validity: field.combinedValidityData.state, transitionStatus: transition.transitionStatus });
</script>
{@render children(validityState)}
