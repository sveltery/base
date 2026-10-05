<script lang="ts">
  import { untrack } from 'svelte';
  // Ported from Base UI v1.8.0 FieldError.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';

  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
  import { fieldValidityMapping } from '../internals/field-constants/constants.js';
  import { useFormContext } from '../internals/form-context/FormContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import ErrorMessageList from './ErrorMessageList.svelte';
  import type { FieldErrorProps, FieldErrorState } from './types.js';
  let { render, id: idProp, class: classProp, match, style, ref = $bindable(), ...elementProps }: FieldErrorProps = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const field = useFieldRootContext(false);
  const { setMessageIds } = useLabelableContext();
  const form = useFormContext();
  const formError = $derived(field.name && Object.hasOwn(form.errors, field.name) ? form.errors[field.name] : null);
  const hasFormError = $derived(Boolean(Array.isArray(formError) ? formError.length : formError));
  const hasSpecificMatch = $derived(typeof match === 'string');
  const rendered = $derived.by(() => {
    if (match === true) return true;
    if (field.state.disabled) return false;
    if (typeof match === 'string') return Boolean(field.validityData.state[match]);
    return hasFormError || field.validityData.state.valid === false;
  });
  const transition = useTransitionStatus(() => rendered);
  $effect(() => {
    if (!rendered || !id) return;
    const installedId = id;
    untrack(() => setMessageIds(v => v.concat(installedId)));
    return () => { setMessageIds(v => v.filter(item => item !== installedId)); };
  });
  const errorRef = $state<{ current: HTMLElement | null }>({ current: null });
  let lastRenderedMessage = $state.raw<string | string[] | null>(null);
  let lastRenderedMessageKey = $state<string | null>(null);
  const error = $derived(!hasSpecificMatch && hasFormError ? formError : field.validityData.errors.length > 1 ? field.validityData.errors : field.validityData.error);
  const errorKey = $derived(Array.isArray(error) ? JSON.stringify(error) : error);
  // Source retained message/key state uses native pre-DOM synchronization on visibility/message changes.
  $effect.pre(() => {
    if (rendered && errorKey !== lastRenderedMessageKey) { lastRenderedMessageKey = errorKey; lastRenderedMessage = error; }
  });
  const message = $derived(rendered ? error : lastRenderedMessage);
  useOpenChangeComplete({
    get open() { return rendered; }, ref: errorRef,
    onComplete() { if (!rendered) transition.setMounted(false); },
  });
  const errorState: FieldErrorState = $derived({ ...field.state, transitionStatus: transition.transitionStatus });
  const stateAttributesMapping = { ...fieldValidityMapping, ...transitionStatusMapping };
  const forwardedRef = { get current() { return ref ?? null; }, set current(value: HTMLElement | null) { ref = value; } };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    ref: [forwardedRef, errorRef], state: errorState,
    props: [{ id, children: errorContent }, elementProps], stateAttributesMapping, enabled: transition.mounted,
  });
</script>
{#snippet errorContent()}
  {#if Array.isArray(message)}
    {#if message.length > 1}<ErrorMessageList messages={message} />{:else}{message[0] ?? ''}{/if}
  {:else}{message ?? ''}{/if}
{/snippet}
{#if transition.mounted}<RenderElement tag="div" {componentProps} {params} />{/if}
