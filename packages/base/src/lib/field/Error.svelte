<script lang="ts">
  // Base UI v1.8.0 FieldError and animation completion; MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveFieldProps } from './props.js';
  import { afterAnimations } from '../collapsible/animations.js';
  import { getFieldContext } from './context.js';
  import { getLabelableContext } from './labelable.svelte.js';
  import { stateAttributes } from './state.js';
  import { createFieldTransition } from './transition.svelte.js';
  import ErrorMessageList from './ErrorMessageList.svelte';
  import type { FieldErrorProps } from './types.js';
  let { ref = $bindable(), ...componentProps }: FieldErrorProps = $props();
  const render = $derived(componentProps.render), idProp = $derived(componentProps.id), match = $derived(componentProps.match);
  const nativeProps = $derived.by(() => {
    const native = { ...componentProps };
    delete native.children; delete native.render; delete native.id; delete native.match;
    return native;
  });
  const field = getFieldContext(false)!;
  const labelable = getLabelableContext()!;
  const instanceId = $props.id();
  const id = $derived(idProp ?? `base-ui-${instanceId}`);
  const hasSpecificMatch = $derived(typeof match === 'string');
  const hasFormError = $derived(Boolean(Array.isArray(field.formError) ? field.formError.length : field.formError));
  const rendered = $derived(match === true || (!field.state.disabled && (hasSpecificMatch ? Boolean(field.validityData.state[match as keyof ValidityState]) : hasFormError || field.validityData.state.valid === false)));
  const error = $derived(!hasSpecificMatch && hasFormError ? field.formError : field.validityData.errors.length > 1 ? field.validityData.errors : field.validityData.error);
  let lastError = $state.raw<string | string[] | null>(untrack(() => rendered ? error : null));
  const message = $derived(rendered ? error : lastError);
  let errorElement = $state<HTMLElement | null>(null);
  const transition = createFieldTransition(() => rendered, () => errorElement);
  const errorState = $derived({ ...field.state, transitionStatus: transition.transitionStatus });
  $effect.pre(() => { if (rendered) lastError = error; });
  $effect(() => { const open = rendered, current = id; if (open && current) return untrack(() => labelable.addMessage(current)); });
  $effect(() => {
    const open = rendered;
    const node = errorElement;
    if (!node) return;
    return afterAnimations(node, () => { if (!open && !rendered) transition.setMounted(false); }, open);
  });
  function attach(node: HTMLElement) { errorElement = node; return () => { if (errorElement === node) errorElement = null; }; }
  const internal = $derived({
    ...stateAttributes(errorState), id,
    'data-starting-style': transition.transitionStatus === 'starting' ? '' : undefined,
    'data-ending-style': transition.transitionStatus === 'ending' ? '' : undefined,
  });
</script>
{#snippet errorContent()}
  {#if Array.isArray(message)}
    {#if message.length > 1}<ErrorMessageList messages={message} />{:else}{message[0] ?? ''}{/if}
  {:else}{message ?? ''}{/if}
{/snippet}
{#if transition.mounted}
  <Element tag="div" {internal} props={resolveFieldProps(nativeProps, errorState)} state={errorState} {render} children={Object.hasOwn(componentProps, 'children') ? componentProps.children : errorContent} {attach} bind:ref />
{/if}
