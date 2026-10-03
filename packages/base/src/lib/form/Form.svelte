<script lang="ts" generics="Values extends object = Record<string, unknown>">
  // Mechanically ported from Base UI v1.8.0 form/Form.tsx.
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { EMPTY_OBJECT } from '../utils/empty.js';
  import { createGenericEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { setFormContext, type FormContext } from '../internals/form-context/FormContext.js';
  import RenderElement from '../internals/RenderElement.svelte';
  import { useValueChanged } from '../internals/useValueChanged.svelte.js';
  import type { FormActions, FormErrors, FormProps, FormState } from './types.js';
  let {
    render, class: classProp, validationMode = 'onSubmit', errors: externalErrors,
    onsubmit, onFormSubmit, actionsRef, style, children, ref = $bindable(), ...elementProps
  }: FormProps<Values> = $props();
  const formRef: FormContext['formRef'] = { current: { fields: new Map() } };
  const elementRef = $state<{ current: HTMLFormElement | null }>({ current: null });
  const submittedRef = { current: false };
  const submitCountRef = { current: 0 };
  const focusFirstInvalid = useStableCallback(() => {
    let hasInvalid = false;
    let firstControl: HTMLElement | null = null;
    for (const field of formRef.current.fields.values()) {
      if (field.validityData.state.valid !== false) continue;
      hasInvalid = true;
      const control = field.controlRef.current;
      if (control && (!firstControl || comesBeforeInSameTree(control, firstControl))) firstControl = control;
    }
    if (firstControl) {
      firstControl.focus();
      if (firstControl.tagName === 'INPUT') (firstControl as HTMLInputElement).select();
      return true;
    }
    return hasInvalid;
  });
  let errors = $state<FormErrors | undefined>(untrack(() => externalErrors));
  useValueChanged(() => externalErrors, () => { errors = externalErrors; });
  $effect(() => {
    void errors;
    untrack(() => {
      if (!submittedRef.current) return;
      submittedRef.current = false;
      focusFirstInvalid();
    });
  });
  const actions: FormActions = {
    validate(fieldName) {
      if (fieldName) Array.from(formRef.current.fields.values()).find(field => field.name === fieldName)?.validate();
      else formRef.current.fields.forEach(field => field.validate());
    },
  };
  $effect(() => {
    const target = actionsRef;
    if (!target) return;
    target.current = actions;
    return () => { if (target.current === actions) target.current = null; };
  });
  const internal = {
    noValidate: true,
    onsubmit(event: Parameters<NonNullable<FormProps<Values>['onsubmit']>>[0]) {
      submitCountRef.current += 1;
      formRef.current.fields.forEach(field => field.validate());
      if (focusFirstInvalid()) {
        event.preventDefault();
        return;
      }
      submittedRef.current = true;
      onsubmit?.(event);
      if (onFormSubmit) {
        event.preventDefault();
        const formValues: Record<string, unknown> = {};
        formRef.current.fields.forEach(field => { if (field.name) formValues[field.name] = field.getValue(); });
        onFormSubmit(formValues as Values, createGenericEventDetails(REASONS.none, event));
      }
    },
  };
  const clearErrors = useStableCallback((name: string | undefined) => {
    if (!name) return;
    if (!errors || !Object.hasOwn(errors, name)) return;
    const nextErrors = { ...errors };
    delete nextErrors[name];
    errors = nextErrors;
  });
  const contextValue: FormContext = {
    elementRef, formRef, get validationMode() { return validationMode; },
    get errors() { return errors ?? EMPTY_OBJECT; }, clearErrors, submitCountRef,
  };
  setFormContext(contextValue);
  const forwardedRef = { get current() { return ref; }, set current(value: HTMLElement | null | undefined) { ref = value; } };
  const componentProps = $derived({ render: render ? renderForm : undefined, class: classProp, style });
  const params = $derived({ ref: [forwardedRef, elementRef], props: [internal, elementProps] });
  function comesBeforeInSameTree(element: Node, reference: Node) {
    const position = element.compareDocumentPosition(reference);
    return (position & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 && (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }
</script>
{#snippet renderForm(nativeProps: Record<string | symbol, unknown>, state: FormState, content: Snippet | undefined)}
  {@render render!(nativeProps as HTMLFormAttributes & { noValidate?: boolean } & Record<string | symbol, unknown>, state, content)}
{/snippet}
<RenderElement tag="form" {componentProps} {params} {children} />
