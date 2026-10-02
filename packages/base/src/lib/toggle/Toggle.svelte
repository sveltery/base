<script lang="ts">
  // Adapted from Base UI v1.8.0 Toggle and useControlled at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { getButtonProps } from '../button/props.js';
  import { mergeProps } from '../merge-props/index.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import type { ToggleProps } from './types.js';
  let { children, render, pressed: pressedProp, defaultPressed = false, disabled = false,
    nativeButton = true, onPressedChange, ref = $bindable(),
    // Upstream deliberately consumes these props without forwarding them.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    form: _form, type: _type, value: _value, ...props }: ToggleProps = $props();
  // The pinned helper fixes the mode and default at the initial render.
  const controlled = untrack(() => pressedProp !== undefined);
  let internalPressed = $state(untrack(() => defaultPressed));
  const pressed = $derived(controlled && pressedProp !== undefined ? pressedProp : internalPressed);
  const toggleState = $derived({ pressed, disabled });
  function toggle(event: MouseEvent, pressedSnapshot: boolean, callbackSnapshot: ToggleProps['onPressedChange']) {
    const nextPressed = !pressedSnapshot;
    const details = createChangeEventDetails('none', event);
    callbackSnapshot?.(nextPressed, details);
    if (!details.isCanceled && !controlled) internalPressed = nextPressed;
  }
  // Preserve enumerable attachment symbols alongside merged string props.
  const resolved = $derived.by(() => {
    // Like the pinned rendered closure, this snapshot survives earlier consumer
    // writes and same-turn clicks; the next rendered props receive a fresh one.
    const pressedSnapshot = pressed;
    const callbackSnapshot = onPressedChange;
    return getButtonProps({ ...props, ...mergeProps({
      'aria-pressed': pressedSnapshot, 'data-pressed': pressedSnapshot ? '' : undefined,
      onclick: (event: MouseEvent) => toggle(event, pressedSnapshot, callbackSnapshot),
    }, props) }, disabled, false, nativeButton);
  });
</script>
<!-- Pinned useRenderElement defaults the native host type even with nativeButton=false. -->
<Element tag="button" internal={render ? {} : { type: 'button' }} props={resolved} state={toggleState} {render} {children} bind:ref />
