<script lang="ts">
  // Base UI v1.8.0 standalone Input/Field.Control adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import { tick } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import type { InputProps } from './types.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { children, render, class: classProp, disabled = false, id, value, defaultValue, onValueChange, ref = $bindable(), ...props }: InputProps = $props();
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const state = $derived({ disabled, touched: false, dirty: false, filled: false, focused: false, valid: null });
  const resolvedProps = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
    return { ...props, class: classValue == null ? undefined : resolveClassValue(classValue) };
  });
  function attach(node: HTMLElement) {
    // Native Svelte does not restore a rejected controlled edit. Synchronize the external
    // DOM after the owner has processed its callback, without manufacturing reset defaults.
    let connected = true;
    const inputParent = node.parentNode ?? node.getRootNode();
    const ownerWindow = node.ownerDocument.defaultView ?? window;
    let restoreTimer: number | undefined;
    let editVersion = 0;
    let resetRoot: Node | undefined;
    let resetEvents: Event[] = [];
    const observeReset = (event: Event) => {
      if (event.target === (node as HTMLInputElement).form) resetEvents.push(event);
    };
    function clearPendingRestore() {
      if (restoreTimer !== undefined) ownerWindow.clearTimeout(restoreTimer);
      restoreTimer = undefined;
      resetRoot?.removeEventListener('reset', observeReset, true);
      resetRoot = undefined;
    }
    function restoreValue() {
      const wasReset = resetEvents.some(event => !event.defaultPrevented);
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
      resetEvents = [];
      if (value === undefined) return;
      // Capture before form handlers can stop propagation; check the live form association.
      // An uncanceled native reset during this edit keeps its native default.
      resetRoot = node.getRootNode();
      resetRoot.addEventListener('reset', observeReset, true);
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
    };
  }
  const internal = $derived({
    id: id ?? generatedId, disabled, 'data-disabled': disabled ? '' : undefined,
    // Preserve native value/defaultValue setters, including both getters in remote .as spreads.
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value !== undefined ? { value } : {}),
    oninput(event: Event) {
      const next = (event.currentTarget as HTMLInputElement).value;
      onValueChange?.(next, createChangeEventDetails('none', event));
      // Standalone Field context setters and validation callbacks are no-ops. In particular,
      // cancel() does not roll back an uncontrolled native edit or native preventDefault().
    },
  });
</script>
{#snippet nativeInput(nativeProps: Record<string | symbol, unknown>)}
  <input {...nativeProps as HTMLInputAttributes} />
{/snippet}
<Element tag="input" {internal} props={resolvedProps} {state} render={render ?? nativeInput} {children} {attach} bind:ref />
