<script module lang="ts">
  // Native radio restoration consults the final host group after consumer callbacks settle.
  const checkedOwners = new WeakMap<HTMLInputElement, () => void>();
  const checkedTrackers = new WeakMap<HTMLInputElement, { value: string }>();
  const checkedRequests = new WeakMap<Event, boolean>();
  const checkedCompletions = new WeakMap<Event, () => void>();
  function updateCheckedTracker(input: HTMLInputElement) {
    const tracker = checkedTrackers.get(input);
    const value = String(input.checked);
    if (!tracker) return true;
    if (value === tracker.value) return false;
    tracker.value = value;
    return true;
  }
  function restoreCheckedGroup(input: HTMLInputElement) {
    if (input.tagName !== 'INPUT' || input.type !== 'checkbox' && input.type !== 'radio') return;
    checkedOwners.get(input)?.();
    if (input.type === 'radio' && input.name) {
      const root = input.getRootNode() as Document | ShadowRoot | HTMLElement;
      for (const other of root.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
        if (other !== input && other.name === input.name && other.form === input.form) checkedOwners.get(other)?.();
      }
      for (const other of root.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
        if (other.name === input.name && other.form === input.form) updateCheckedTracker(other);
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
    let nativeCheckedEdit: { event: Event; checked: boolean } | undefined;
    let nativeCheckedEditCleanupTimer: number | undefined;
    let checkedInputRoot: Node | undefined;
    let checkedInputEvent: Event | undefined;
    let checkedInputCleanupTimer: number | undefined;
    const input = node as HTMLInputElement;
    let checkedDescriptor: PropertyDescriptor | undefined;
    const restoreChecked = () => {
      // React assigns even when native rollback already matches the owner: the setter
      // also synchronizes the property tracker for a subsequent canceled activation.
      if (node.tagName === 'INPUT' && checked != null) input.checked = checked;
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
      if (input.type === 'checkbox' || input.type === 'radio') {
        // React's checked tracker observes JavaScript property assignments, but native
        // activation and form reset bypass that setter. Preserve those same boundaries.
        const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'checked');
        if (!Object.prototype.hasOwnProperty.call(input, 'checked') && descriptor?.get && descriptor.set) {
          checkedDescriptor = descriptor;
          const tracker = { value: String(input.checked) };
          checkedTrackers.set(input, tracker);
          Object.defineProperty(input, 'checked', {
            configurable: true, enumerable: descriptor.enumerable,
            get() { return descriptor.get!.call(this); },
            set(next) { tracker.value = String(next); descriptor.set!.call(this, next); },
          });
        }
      }
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
    function clearCheckedInput() {
      if (checkedInputCleanupTimer !== undefined) ownerWindow.clearTimeout(checkedInputCleanupTimer);
      checkedInputCleanupTimer = undefined;
      checkedInputRoot?.removeEventListener('input', finishCheckedInput);
      if (checkedInputEvent) checkedCompletions.delete(checkedInputEvent);
      checkedInputRoot = undefined; checkedInputEvent = undefined;
    }
    function finishCheckedInput(event: Event) {
      if (event !== checkedInputEvent) return;
      clearCheckedInput();
      if (connected) restoreCheckedGroup(input);
    }
    const observeOwnEdit = (event: Event) => {
      if (event.target !== node) return;
      if (nativeCheckedEdit && !nativeCheckedEdit.event.defaultPrevented) {
        // The click channel restores source ownership first. Native input consumers
        // still receive the activation's edit, then their live owner is reasserted.
        input.checked = nativeCheckedEdit.checked;
        nativeCheckedEdit = undefined;
        clearCheckedInput();
        checkedInputEvent = event; checkedInputRoot = node.getRootNode();
        checkedCompletions.set(event, () => finishCheckedInput(event));
        checkedInputRoot.addEventListener('input', finishCheckedInput);
        queueMicrotask(() => {
          if (checkedInputEvent !== event) return;
          if (event.eventPhase !== Event.NONE) checkedInputCleanupTimer = ownerWindow.setTimeout(() => finishCheckedInput(event), 0);
          else finishCheckedInput(event);
        });
      }
      restoreControlledEdit(event);
    };
    function clearCheckedClick() {
      if (checkedClickCleanupTimer !== undefined) ownerWindow.clearTimeout(checkedClickCleanupTimer);
      checkedClickCleanupTimer = undefined;
      checkedClickRoot?.removeEventListener('click', finishCheckedClick);
      if (checkedClickEvent) checkedCompletions.delete(checkedClickEvent);
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
      const changed = updateCheckedTracker(input);
      checkedRequests.set(event, changed);
      if (!changed) return;
      nativeCheckedEdit = { event, checked: input.checked };
      if (nativeCheckedEditCleanupTimer !== undefined) ownerWindow.clearTimeout(nativeCheckedEditCleanupTimer);
      nativeCheckedEditCleanupTimer = ownerWindow.setTimeout(() => { nativeCheckedEdit = undefined; nativeCheckedEditCleanupTimer = undefined; }, 0);
      checkedClickEvent = event; checkedClickRoot = node.getRootNode();
      checkedCompletions.set(event, () => finishCheckedClick(event));
      // Run after Svelte's delegated consumer handlers, while native activation is still
      // dispatching. This also observes a replacement handler's work after props.onclick.
      checkedClickRoot.addEventListener('click', finishCheckedClick);
      queueMicrotask(() => {
        if (checkedClickEvent !== event) return;
        if (event.eventPhase !== Event.NONE) checkedClickCleanupTimer = ownerWindow.setTimeout(() => finishCheckedClick(event), 0);
        else finishCheckedClick(event);
      });
    };
    // Observe this host before target attachments can reset its form, without altering dispatch.
    inputParent.addEventListener('input', observeOwnEdit, true);
    inputParent.addEventListener('click', observeCheckedClick, true);
    return () => {
      connected = false;
      clearPendingRestore();
      clearCheckedClick();
      clearCheckedInput(); nativeCheckedEdit = undefined;
      if (nativeCheckedEditCleanupTimer !== undefined) ownerWindow.clearTimeout(nativeCheckedEditCleanupTimer);
      inputParent.removeEventListener('input', observeOwnEdit, true);
      inputParent.removeEventListener('click', observeCheckedClick, true);
      if (node.tagName === 'INPUT') checkedOwners.delete(input);
      checkedTrackers.delete(input);
      if (checkedDescriptor) Reflect.deleteProperty(input, 'checked');
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
      if (input.tagName === 'INPUT' && (input.type === 'checkbox' || input.type === 'radio') && checkedRequests.get(event) !== false) onValueChange?.(input.value, createChangeEventDetails('none', event));
    },
  });
</script>
{#snippet nativeInput(nativeProps: Record<string | symbol, unknown>, nativeState: InputState, nativeChildren: Snippet | undefined)}
  {const checkedProps = $derived({ ...nativeProps, oninput(event: Event) {
    try { (nativeProps.oninput as ((event: Event) => void) | undefined)?.(event); }
    finally { queueMicrotask(() => checkedCompletions.get(event)?.()); }
  }, onclick(event: MouseEvent) {
    const input = event.currentTarget as HTMLInputElement;
    try { (nativeProps.onclick as ((event: MouseEvent) => void) | undefined)?.(event); }
    // Replacement callbacks may continue after props.onclick returns. Their native root
    // completion observer restores only after that final consumer work has run.
    finally {
      if (!render && checkedRequests.get(event) !== false) restoreCheckedGroup(input);
      // A replacement can stop the native root completion listener after forwarding
      // props. Its remaining callback work must finish before this fallback restores.
      if (render) queueMicrotask(() => checkedCompletions.get(event)?.());
    }
  } })}
  {#if render}{@render render(checkedProps, nativeState, nativeChildren)}
  {:else}<input {...checkedProps as HTMLInputAttributes} />{/if}
{/snippet}
<Element tag="input" {internal} props={resolvedProps} {state} render={nativeInput} {children} {attach} bind:ref />
