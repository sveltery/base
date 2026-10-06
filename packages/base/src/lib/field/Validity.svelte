<script lang="ts">
  // Ported from Base UI v1.8.0 FieldValidity.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { getCombinedFieldValidityData } from './utils/getCombinedFieldValidityData.js';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import type { FieldValidityProps, FieldValidityState } from './types.js';
  let { children }: FieldValidityProps = $props();
  const field = useFieldRootContext(false);
  const combinedFieldValidityData = $derived(
    getCombinedFieldValidityData(field.validityData, field.invalid),
  );
  const isInvalid = $derived(combinedFieldValidityData.state.valid === false);
  const transition = useTransitionStatus(() => isInvalid);
  // A derived value preserves public snippet state identity across unrelated field-state changes.
  const fieldValidityState: FieldValidityState = $derived({
    ...combinedFieldValidityData,
    validity: combinedFieldValidityData.state,
    transitionStatus: transition.transitionStatus,
  });
</script>

{@render children(fieldValidityState)}
