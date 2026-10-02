<script lang="ts" generics="Values extends object = Record<string, unknown>">
  // Base UI v1.8.0 Form; MIT: THIRD_PARTY_NOTICES.md.
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from '../field/props.js';
  import { createGenericEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { getFormValues, setFormContext, type FormContext, type RegisteredField } from './context.js';
  import type { FormActions, FormErrors, FormProps, FormState } from './types.js';
  let { children, render, validationMode = 'onSubmit', errors: externalErrors, onsubmit, onFormSubmit, actionsRef, noValidate, novalidate, ref = $bindable(), ...props }: FormProps<Values> = $props();
  const fields = new Map<string, RegisteredField>();
  let errors = $state<FormErrors | undefined>(untrack(() => externalErrors));
  let previousErrors = untrack(() => externalErrors);
  let element = $state<HTMLFormElement | null>(null);
  let submitted = false;
  let submitCount = 0;
  const context: FormContext = {
    get element() { return element; },
    get errors() { return errors ?? {}; },
    get validationMode() { return validationMode; },
    get submitCount() { return submitCount; },
    fields,
    clearErrors(name) {
      if (!name || !errors || !Object.hasOwn(errors, name)) return;
      const next = { ...errors };
      delete next[name];
      errors = next;
    },
  };
  setFormContext(context);
  function focusFirstInvalid() {
    let hasInvalid = false;
    let first: HTMLElement | null = null;
    for (const field of fields.values()) {
      if (field.validityData.state.valid !== false) continue;
      hasInvalid = true;
      const control = field.control;
      if (control) {
        const position = first ? control.compareDocumentPosition(first) : 0;
        if (!first || (!(position & 1) && (position & 4))) first = control;
      }
    }
    if (first) {
      first.focus();
      if (first.tagName === 'INPUT') (first as HTMLInputElement).select();
    }
    return hasInvalid;
  }
  $effect(() => {
    const next = externalErrors;
    if (next !== previousErrors) {
      previousErrors = next;
      errors = next;
    }
  });
  $effect(() => {
    void errors;
    if (submitted) {
      submitted = false;
      untrack(focusFirstInvalid);
    }
  });
  const actions: FormActions = {
    validate(name) {
      if (name) Array.from(fields.values()).find(field => field.name === name)?.validate();
      else fields.forEach(field => field.validate());
    },
  };
  $effect(() => {
    const target = actionsRef;
    if (!target) return;
    target.current = actions;
    return () => { if (target.current === actions) target.current = null; };
  });
  function attach(node: HTMLElement) {
    element = node as HTMLFormElement;
    return () => { if (element === node) element = null; };
  }
  const internal = $derived({
    noValidate: noValidate ?? novalidate ?? true,
    onsubmit(event: Parameters<NonNullable<FormProps<Values>['onsubmit']>>[0]) {
      submitCount += 1;
      fields.forEach(field => field.validate());
      if (focusFirstInvalid()) { event.preventDefault(); return; }
      submitted = true;
      onsubmit?.(event);
      if (onFormSubmit) {
        event.preventDefault();
        onFormSubmit(getFormValues(context) as Values, createGenericEventDetails('none', event));
      }
    },
  });
</script>
{#snippet renderForm(nativeProps: Record<string | symbol, unknown>, state: FormState, content: Snippet | undefined)}
  {@render render!(nativeProps as HTMLFormAttributes & { noValidate?: boolean } & Record<string | symbol, unknown>, state, content)}
{/snippet}
<Element tag="form" {internal} props={resolveFieldProps(props, {})} state={{}} render={render ? renderForm : undefined} {children} {attach} bind:ref />
