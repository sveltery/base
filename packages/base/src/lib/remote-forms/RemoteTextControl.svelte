<script lang="ts">
  import FieldControl from '../field/Control.svelte';
  import { setFieldControlNameContext } from '../internals/field-control-name/FieldControlNameContext.js';
  import { useRemoteFieldContext } from './RemoteFieldContext.js';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import type { FieldControlState } from '../field/types.js';
  import type { Snippet } from 'svelte';
  import type { RemoteControlProps } from './control.types.js';
  import type { HTMLProps } from '../internals/types.js';
  let { ref = $bindable(), render, style, onValueChange, ...props }: RemoteControlProps = $props();
  const remote = useRemoteFieldContext();
  const controlProps = $derived.by(() => {
    const {
      onCheckedChange: _onCheckedChange,
      nativeButton: _nativeButton,
      inputRef: _inputRef,
      uncheckedValue: _uncheckedValue,
      ...nativeProps
    } = props;
    void [_onCheckedChange, _nativeButton, _inputRef, _uncheckedValue];
    const descriptor = { ...remote?.descriptor, ...nativeProps };
    // An owned empty remote field is the native empty string from its first mount.
    // Explicit consumer values still select the original controlled/uncontrolled API.
    return remote?.accessor &&
      remote.descriptor &&
      !Object.hasOwn(nativeProps, 'value') &&
      descriptor.value === undefined
      ? { ...descriptor, value: '' }
      : descriptor;
  });
  setFieldControlNameContext({
    get name() {
      return controlProps.name ?? undefined;
    },
  });
</script>

{#snippet renderText(
  nativeProps: HTMLProps,
  state: FieldControlState,
  content: Snippet | undefined,
)}
  {@render render!(nativeProps, state, content)}
{/snippet}
<FieldControl
  {...controlProps}
  style={typeof style === 'function'
    ? (state) => toNativeStyle(style(state))
    : toNativeStyle(style)}
  render={render ? renderText : undefined}
  onValueChange={(value, details) => onValueChange?.(value, details)}
  bind:ref
/>
