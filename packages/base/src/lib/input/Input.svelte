<script module lang="ts">
  // Native radio restoration consults the final host group after consumer callbacks settle.
  const checkedOwners = new WeakMap<HTMLInputElement, () => void>();
  function restoreCheckedGroup(input: HTMLInputElement) {
    if (input.tagName !== 'INPUT' || input.type !== 'checkbox' && input.type !== 'radio') return;
    checkedOwners.get(input)?.();
    if (input.type === 'radio' && input.name) {
      const root = input.getRootNode() as Document | ShadowRoot | HTMLElement;
      for (const other of root.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
        if (other !== input && other.name === input.name && other.form === input.form) checkedOwners.get(other)?.();
      }
    }
  }
</script>
<script lang="ts">
  // Base UI v1.8.0 standalone Input/Field.Control adaptation; MIT: THIRD_PARTY_NOTICES.md.
  import { tick, untrack, type Snippet } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import type { InputProps, InputState } from './types.js';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { children, render, class: classProp, disabled = false, id, value, defaultValue, checked, defaultChecked, onValueChange, ref = $bindable(), ...props }: InputProps = $props();
  const initialChecked = untrack(() => checked);
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
    let resetEvents: { event: Event; matches: boolean }[] = [];
    let checkedClickRoot: Node | undefined;
    let checkedClickEvent: Event | undefined;
    let checkedClickCleanupTimer: number | undefined;
    const input = node as HTMLInputElement;
    const restoreChecked = () => {
      if (node.tagName === 'INPUT' && checked != null && input.checked !== checked) input.checked = checked;
    };
    // React's native input initializes a controlled checkable's reset default from checked.
    // Later checked prop changes leave that initial default intact. A replacement host starts
    // with its own current checked prop, just as a newly mounted native React input does.
    if (node.tagName === 'INPUT') {
      const currentChecked = input.checked;
      if (checked != null) input.defaultChecked = checked;
      // Initializing checked also marks native checked state dirty, so a later defaultChecked
      // update changes the reset default without changing the current selection, as in React.
      input.checked = currentChecked;
      checkedOwners.set(input, restoreChecked);
    }
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
      if (!connected) return;
      if (value !== undefined && !wasReset) {
        const next = value == null ? '' : String(value);
        if (input.value !== next) input.value = next;
      }
    }
    const restoreControlledEdit = (event: Event) => {
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
    const observeOwnEdit = (event: Event) => { if (event.target === node) restoreControlledEdit(event); };
    function clearCheckedClick() {
      if (checkedClickCleanupTimer !== undefined) ownerWindow.clearTimeout(checkedClickCleanupTimer);
      checkedClickCleanupTimer = undefined;
      checkedClickRoot?.removeEventListener('click', finishCheckedClick);
      checkedClickRoot = undefined; checkedClickEvent = undefined;
    }
    function finishCheckedClick(event: Event) {
      if (event !== checkedClickEvent) return;
      clearCheckedClick();
      if (connected) restoreCheckedGroup(input);
    }
    const observeCheckedClick = (event: Event) => {
      if (event.target !== node || node.tagName !== 'INPUT' || input.type !== 'checkbox' && input.type !== 'radio') return;
      clearCheckedClick();
      checkedClickEvent = event; checkedClickRoot = node.getRootNode();
      // Run after Svelte's delegated consumer handlers, while native activation is still
      // dispatching. This also observes a replacement handler's work after props.onclick.
      checkedClickRoot.addEventListener('click', finishCheckedClick);
      queueMicrotask(() => {
        if (checkedClickEvent !== event) return;
        if (event.eventPhase !== Event.NONE) checkedClickCleanupTimer = ownerWindow.setTimeout(clearCheckedClick, 0);
        else clearCheckedClick();
      });
    };
    // Observe this host before target attachments can reset its form, without altering dispatch.
    inputParent.addEventListener('input', observeOwnEdit, true);
    inputParent.addEventListener('click', observeCheckedClick, true);
    return () => {
      connected = false;
      clearPendingRestore();
      clearCheckedClick();
      inputParent.removeEventListener('input', observeOwnEdit, true);
      inputParent.removeEventListener('click', observeCheckedClick, true);
      if (node.tagName === 'INPUT') checkedOwners.delete(input);
    };
  }
  const internal = $derived({
    id: id ?? generatedId, disabled, 'data-disabled': disabled ? '' : undefined,
    // Preserve native value/defaultValue setters, including both getters in remote .as spreads.
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value !== undefined ? { value } : {}),
    ...(checked != null ? { checked, defaultChecked: initialChecked } : defaultChecked !== undefined ? { defaultChecked } : {}),
    oninput(event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      if (input.tagName === 'INPUT' && (input.type === 'checkbox' || input.type === 'radio')) return;
      const next = input.value;
      onValueChange?.(next, createChangeEventDetails('none', event));
      // Standalone Field context setters and validation callbacks are no-ops. In particular,
      // cancel() does not roll back an uncontrolled native edit or native preventDefault().
    },
    onclick(event: MouseEvent) {
      const input = event.currentTarget as HTMLInputElement;
      if (input.tagName === 'INPUT' && (input.type === 'checkbox' || input.type === 'radio')) onValueChange?.(input.value, createChangeEventDetails('none', event));
    },
  });
</script>
{#snippet nativeInput(nativeProps: Record<string | symbol, unknown>, nativeState: InputState, nativeChildren: Snippet | undefined)}
  {const checkedProps = $derived({ ...nativeProps, onclick(event: MouseEvent) {
    const input = event.currentTarget as HTMLInputElement;
    try { (nativeProps.onclick as ((event: MouseEvent) => void) | undefined)?.(event); }
    // Replacement callbacks may continue after props.onclick returns. Their native root
    // completion observer restores only after that final consumer work has run.
    finally { if (!render) restoreCheckedGroup(input); }
  } })}
  {#if render}{@render render(checkedProps, nativeState, nativeChildren)}
  {:else}<input {...checkedProps as HTMLInputAttributes} />{/if}
{/snippet}
<Element tag="input" {internal} props={resolvedProps} {state} render={nativeInput} {children} {attach} bind:ref />
