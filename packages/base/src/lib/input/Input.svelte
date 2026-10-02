<script lang="ts">
  // Base UI v1.8.0 standalone Input/Field.Control adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import { tick, untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import type { InputProps } from './types.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getFieldContext } from '../field/context.js';
  import { getLabelableContext } from '../field/labelable.svelte.js';
  import { getFormContext } from '../form/context.js';
  import { DEFAULT_FIELD_STATE, stateAttributes } from '../field/state.js';
  let { children, render, class: classProp, disabled: disabledProp = false, id: idProp, name: nameProp, autofocus = false, value, defaultValue, onValueChange, ref = $bindable(), ...props }: InputProps = $props();
  const field = getFieldContext();
  const labelable = getLabelableContext();
  const form = getFormContext();
  const controlSource = Symbol();
  const labelSource = Symbol();
  let inputElement = $state<HTMLInputElement | null>(null);
  let hadExplicitId = false;
  let labelRegistered = false;
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const disabled = $derived(Boolean(field?.state.disabled || disabledProp));
  const name = $derived(field?.name ?? nameProp);
  const id = $derived(labelable?.controlId ?? idProp ?? generatedId);
  const inputState = $derived({ ...(field?.state ?? DEFAULT_FIELD_STATE), disabled });
  const serializedValue = $derived(value == null ? undefined : String(value));
  let previousValue = untrack(() => serializedValue);
  $effect(() => {
    const explicit = idProp;
    if (!labelable) return;
    if (explicit !== undefined) { hadExplicitId = true; labelRegistered = true; untrack(() => labelable.registerControlId(labelSource, explicit)); }
    else if (hadExplicitId) { labelRegistered = true; untrack(() => labelable.registerControlId(labelSource, generatedId)); }
    else untrack(() => labelable.resetControlId());
  });
  $effect(() => {
    const node = inputElement;
    const currentId = id, currentName = nameProp ?? undefined, currentValue = serializedValue, enabled = !disabled;
    untrack(() => field?.registerControl(controlSource, node && enabled ? { id: currentId, name: currentName, value: currentValue, control: node, getValue: () => field.input?.value } : undefined));
  });
  $effect(() => {
    const current = serializedValue;
    const node = inputElement;
    if (node) untrack(() => field?.setFilled((current ?? node.value) !== ''));
    if (current !== previousValue) {
      previousValue = current;
      if (current !== undefined) untrack(() => {
        form?.clearErrors(name ?? undefined);
        field?.setDirty(current !== (field.validityData.initialValue ?? ''));
        field?.change(current);
      });
    }
  });
  $effect(() => () => {
    if (enterTimer !== undefined) clearTimeout(enterTimer);
    field?.registerControl(controlSource, undefined);
    if (labelRegistered) labelable?.registerControlId(labelSource, undefined);
  });
  const resolvedProps = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(inputState) : classProp;
    let resolved: Record<string, unknown> = { ...props, class: classValue == null ? undefined : resolveClassValue(classValue) };
    if (labelable) resolved = labelable.getDescriptionProps(resolved);
    if (field?.state.valid === false && !field.state.disabled && !disabled) resolved['aria-invalid'] = true;
    return resolved;
  });
  function attach(node: HTMLElement) {
    inputElement = node as HTMLInputElement;
    field?.setInput(node as HTMLInputElement);
    if (autofocus && node.ownerDocument.activeElement === node) field?.setFocused(true);
    // Native Svelte does not restore a rejected controlled edit. Synchronize the external
    // DOM after the owner has processed its callback, without manufacturing reset defaults.
    let connected = true;
    const inputParent = node.parentNode ?? node.getRootNode();
    const ownerWindow = node.ownerDocument.defaultView ?? window;
    let restoreTimer: number | undefined;
    let editVersion = 0;
    let resetRoot: Node | undefined;
    let resetEvents: { event: Event; matches: boolean }[] = [];
    const observeReset = (event: Event) => {
      resetEvents.push({ event, matches: event.target === (node as HTMLInputElement).form });
    };
    const finishResetObservation = (event: Event) => {
      const record = resetEvents.find(record => record.event === event);
      if (record) record.matches = event.target === (node as HTMLInputElement).form;
    };
    $effect(() => {
      // Follow controlled native form reassociation while its reset handlers are still running.
      // Once dispatch finishes, later prop changes must not rewrite a completed reset's record.
      void props.form;
      const form = (node as HTMLInputElement).form;
      for (const record of resetEvents) {
        if (record.event.eventPhase !== Event.NONE) record.matches = record.event.target === form;
      }
    });
    function clearPendingRestore() {
      if (restoreTimer !== undefined) ownerWindow.clearTimeout(restoreTimer);
      restoreTimer = undefined;
      resetRoot?.removeEventListener('reset', observeReset, true);
      resetRoot?.removeEventListener('reset', finishResetObservation);
      resetRoot = undefined;
      resetEvents = [];
    }
    function restoreValue() {
      const wasReset = resetEvents.some(record => record.matches && !record.event.defaultPrevented);
      clearPendingRestore();
      if (!connected || value === undefined || wasReset) return;
      const input = node as HTMLInputElement;
      const next = value == null ? '' : String(value);
      if (input.value !== next) input.value = next;
    }
    const restoreControlledEdit = (event: Event) => {
      if (event.target !== node) return;
      const version = ++editVersion;
      clearPendingRestore();
      if (value === undefined) return;
      // Capture before form handlers can stop propagation; check the live form association.
      // An uncanceled native reset during this edit keeps its native default.
      resetRoot = node.getRootNode();
      resetRoot.addEventListener('reset', observeReset, true);
      resetRoot.addEventListener('reset', finishResetObservation);
      void tick().then(() => {
        if (!connected || version !== editVersion) return;
        // Trusted browser dispatch can run microtasks between native listeners.
        // Wait for bubbling and the delegated owner callback before reasserting value.
        if (event.eventPhase !== Event.NONE) {
          restoreTimer = ownerWindow.setTimeout(restoreValue, 0);
          return;
        }
        restoreValue();
      });
    };
    // Observe this host before target attachments can reset its form, without altering dispatch.
    inputParent.addEventListener('input', restoreControlledEdit, true);
    return () => {
      connected = false;
      clearPendingRestore();
      inputParent.removeEventListener('input', restoreControlledEdit, true);
      if (inputElement === node) inputElement = null;
      if (field?.input === node) field.setInput(null);
    };
  }
  const internal = $derived({
    ...stateAttributes(inputState), id, disabled, name, autofocus,
    'aria-labelledby': labelable?.labelId,
    // Preserve native value/defaultValue setters, including both getters in remote .as spreads.
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value !== undefined ? { value } : {}),
    oninput(event: Event) {
      const next = (event.currentTarget as HTMLInputElement).value;
      const details = createChangeEventDetails('none', event);
      onValueChange?.(next, details);
      // A controlled owner accepts or rewrites through value; rejected edits never reach Field state.
      if (value !== undefined) return;
      field?.setDirty(next !== (field.validityData.initialValue ?? ''));
      field?.setFilled(next !== '');
      if (!event.defaultPrevented && !details.isCanceled) { form?.clearErrors(name ?? undefined); field?.change(next); }
    },
    onfocus() { field?.setFocused(true); },
    onblur(event: FocusEvent) {
      field?.setTouched(true);
      field?.setFocused(false);
      if (field?.validationMode !== 'onBlur') return;
      const next = (event.currentTarget as HTMLInputElement).value;
      void field.commit(next);
      if (value !== undefined) queueMicrotask(() => {
        const rewritten = field.input?.value;
        if (rewritten !== undefined && rewritten !== next && rewritten !== (field.validityData.initialValue ?? '')) void field.commit(rewritten);
      });
    },
    onkeydown(event: KeyboardEvent) {
      const node = event.currentTarget as HTMLInputElement;
      if (node.tagName !== 'INPUT' || event.key !== 'Enter' || !field) return;
      field.setTouched(true);
      if (node.form && node.form === form?.element && !event.defaultPrevented) {
        const count = form.submitCount;
        if (enterTimer !== undefined) clearTimeout(enterTimer);
        enterTimer = setTimeout(() => { if (form.submitCount === count) void field.commit(node.value); }, 0);
      } else void field.commit(node.value);
    },
  });
</script>
{#snippet nativeInput(nativeProps: Record<string | symbol, unknown>)}
  <input {...nativeProps as HTMLInputAttributes} />
{/snippet}
<Element tag="input" {internal} props={resolvedProps} state={inputState} render={render ?? nativeInput} {children} {attach} bind:ref />
