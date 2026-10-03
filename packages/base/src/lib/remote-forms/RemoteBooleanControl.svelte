<script lang="ts">
  import CheckboxRoot from '../checkbox/root/CheckboxRoot.svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { createRefAttachment } from '../internals/nativeRefAttachment.js';
  import { setFieldControlNameContext } from '../internals/field-control-name/FieldControlNameContext.js';
  import { useFieldRootContext } from '../internals/field-root-context/FieldRootContext.js';
  import { useRemoteFieldContext } from './RemoteFieldContext.js';
  import type { RemoteControlProps, RemoteControlRenderProps, RemoteControlState } from './control.types.js';
  import type { SwitchRootChangeEventDetails } from '../switch/types.js';
  let { render, children, ref = $bindable(), onCheckedChange, onValueChange, ...props }: RemoteControlProps = $props();
  const remote = useRemoteFieldContext();
  const field = useFieldRootContext();
  const descriptor = $derived({ ...remote?.descriptor, ...props });
  setFieldControlNameContext({ get name() { return typeof descriptor.name === 'string' ? descriptor.name : undefined; } });
  function change(checked: boolean, details: SwitchRootChangeEventDetails) {
    onCheckedChange?.(checked, details);
    onValueChange?.(checked, details);
  }
  const semanticProps: RemoteControlRenderProps = $derived.by(() => {
    // Descriptor input-only attributes must never land on the visible family host.
    const { type: _type, files: _files, value, defaultValue: _defaultValue, ...attributes } = descriptor;
    void [_type, _files, _defaultValue];
    return {
      ...attributes,
      checked: remote?.accessor && !Object.hasOwn(props, 'checked')
        ? Boolean(descriptor.checked ?? descriptor.defaultChecked)
        : typeof descriptor.checked === 'boolean' ? descriptor.checked : undefined,
      defaultChecked: typeof descriptor.defaultChecked === 'boolean' ? descriptor.defaultChecked : undefined,
      value: remote?.kind === 'radio' ? value : value == null ? undefined : String(value),
      onCheckedChange: change,
    };
  });
  const state: RemoteControlState = $derived({
    ...field.state,
    checked: semanticProps.checked ?? semanticProps.defaultChecked ?? false,
    disabled: Boolean(field.disabled || semanticProps.disabled),
    readOnly: semanticProps.readOnly ?? false,
    required: semanticProps.required ?? false,
  });
  const attachmentKey = createAttachmentKey();
  const resolveRefAttachment = createRefAttachment<HTMLElement>((node, previous) => {
    if (node !== null || ref === previous) ref = node;
  });
  const renderedProps = $derived({ ...semanticProps, [attachmentKey]: resolveRefAttachment(null) });
</script>
{#if render}
  {@render render(renderedProps, state, children)}
{:else}
  <CheckboxRoot {...semanticProps} {children} bind:ref />
{/if}
