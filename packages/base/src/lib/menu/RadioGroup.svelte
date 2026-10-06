<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  import { untrack } from 'svelte';
  // Original MenuRadioGroup controlled/cancellation/label/context composition (MIT).
  import { Controlled } from '@sveltery/utils/Controlled';

  import { provideMenuRadioGroupContext } from './radio-group/MenuRadioGroupContext.js';
  import { provideMenuGroupContext, type MenuGroupContext } from './group/MenuGroupContext.js';
  import type { MenuRadioGroupProps, MenuRadioGroup } from './types.js';
  let {
    render,
    class: className,
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    disabled = false,
    style,
    'aria-labelledby': ariaLabelledByProp,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuRadioGroupProps = $props();
  let labelId = $state<string | undefined>(undefined);
  const valueState = new Controlled(
    () => valueProp,
    untrack(() => defaultValue),
  );
  const value = $derived(valueState.value);
  const setValue = (newValue: unknown, eventDetails: MenuRadioGroup.ChangeEventDetails) => {
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) return;
    valueState.set(newValue);
  };
  const componentState = $derived({ disabled });
  const setLabelId: MenuGroupContext = (value) => {
    labelId = typeof value === 'function' ? value(labelId) : value;
  };
  provideMenuGroupContext(setLabelId);
  provideMenuRadioGroupContext({
    get value() {
      return value;
    },
    setValue,
    get disabled() {
      return disabled;
    },
  });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      componentState,
      { class: className, style: style },
      {
        role: 'group',
        'aria-labelledby': ariaLabelledByProp ?? labelId,
        'aria-disabled': disabled || undefined,
        ...elementProps,
      },
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, componentState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
