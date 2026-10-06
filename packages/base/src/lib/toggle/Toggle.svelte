<script lang="ts" generics="Value extends string = string">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { untrack } from 'svelte';
  // Source-ordered Base UI v1.8.0 Toggle.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { DEV } from 'esm-env';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { error } from '@sveltery/utils/error';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useToggleGroupContext } from '../toggle-group/ToggleGroupContext.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import CompositeItem from '../internals/composite/item/CompositeItem.svelte';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import type { ToggleProps, ToggleState } from './types.js';
  let {
    class: classProp,
    defaultPressed = false,
    disabled: disabledProp = false,
    onPressedChange,
    pressed: pressedProp,
    render,
    value: valueProp,
    nativeButton = true,
    style,
    children,
    ref = $bindable(),
    // Upstream deliberately consumes these props: Toggle never participates in a form.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    form: _form,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Consume the form type without forwarding it.
    type: _type,
    ...elementProps
  }: ToggleProps<Value> = $props();
  const nativeId = $props.id();
  // The original treats both omitted and empty values as generated identities.
  const value = $derived(useBaseUiId(valueProp || undefined, nativeId));
  const groupContext = useToggleGroupContext<string>();
  const groupValue = $derived(groupContext?.value ?? []);
  const disabled = $derived((disabledProp || groupContext?.disabled) ?? false);
  if (DEV) {
    $effect(() => {
      if (groupContext && valueProp === undefined && groupContext.isValueInitialized) {
        error(
          'A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop.',
          'This will cause issues between the Toggle Group and Toggle values.',
          'Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.',
        );
      }
    });
  }
  const pressedState = new Controlled(
    () => (groupContext ? value !== undefined && groupValue.indexOf(value) > -1 : pressedProp),
    untrack(() => defaultPressed),
  );
  const pressed = $derived(pressedState.value);
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const state: ToggleState = $derived({ disabled, pressed });

  const rendererProps = $derived([
    {
      'aria-pressed': pressed,
      onclick(event: MouseEvent) {
        const nextPressed = !pressed;
        const details = createChangeEventDetails(REASONS.none, event);
        // One shared details object lets the Toggle veto its Group before commit.
        onPressedChange?.(nextPressed, details);
        if (details.isCanceled) return;
        if (value) groupContext?.setGroupValue(value, nextPressed, details);
        if (details.isCanceled) return;
        pressedState.set(nextPressed);
      },
    },
    elementProps,
    getButtonProps,
  ]);

  const itemMetadata = $derived({ disabled, focusableWhenDisabled: false });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      buttonRef?.(host);
      ref = host;
      return () =>
        untrack(() => {
          buttonRef?.(null);
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: classProp, style: style }, rendererProps, undefined),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if groupContext}
  <CompositeItem
    tag="button"
    {render}
    class={classProp}
    {style}
    metadata={itemMetadata}
    {state}
    props={[...rendererProps, { [hostAttachmentKey]: attachHost }]}
    {children}
  />
{:else}
  {#if render}
    {@render render(mergedProps, state, children)}
  {:else}
    <button type="button" {...mergedProps}>{@render children?.()}</button>
  {/if}
{/if}
