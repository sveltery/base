<!-- eslint-disable @typescript-eslint/no-explicit-any -- Preserve the pinned generic default. -->
<script lang="ts" generics="Value = any">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Adapted from AccordionRoot/useControlled/useStableCallback, mui/base-ui v1.8.0
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { warnOnce } from '../collapsible/animations.js';
  import { setAccordionRootContext } from './context.js';
  import { createItemList } from './list.js';
  import { EMPTY_VALUE } from './value.js';
  import type { AccordionRootProps, AccordionRootChangeEventDetails } from './types.js';
  let {
    children,
    render,
    disabled = false,
    hiddenUntilFound = false,
    keepMounted: keepMountedProp,
    loopFocus: _loopFocus,
    onValueChange,
    multiple = false,
    orientation = 'vertical',
    value: valueProp,
    defaultValue: defaultValueProp,
    class: classProp,
    ref = $bindable(),
    ...props
  }: AccordionRootProps<Value> = $props();
  // Deprecated upstream prop is deliberately stripped and has no keyboard behavior.
  untrack(() => _loopFocus);
  const keepMounted = $derived(keepMountedProp ?? false);
  const valueState = new Controlled(
    () => valueProp,
    untrack(() => defaultValueProp ?? EMPTY_VALUE),
  );
  const value = $derived(valueState.value);
  const rootState = $derived({ value, disabled, orientation });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(rootState) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
    };
  });
  const list = createItemList();
  onDestroy(list.destroy);
  function handleValueChange(
    newValue: unknown,
    nextOpen: boolean,
    details: AccordionRootChangeEventDetails,
  ) {
    const itemValue = newValue as Value;
    const nextValue = !multiple
      ? value[0] === itemValue
        ? []
        : [itemValue]
      : nextOpen
        ? [...value, itemValue]
        : value.filter((entry) => entry !== itemValue);
    onValueChange?.(nextValue, details);
    if (!details.isCanceled) valueState.set(nextValue);
  }
  setAccordionRootContext({
    get value() {
      return value;
    },
    get disabled() {
      return disabled;
    },
    get state() {
      return rootState;
    },
    get hiddenUntilFound() {
      return hiddenUntilFound;
    },
    get keepMounted() {
      return keepMounted;
    },
    handleValueChange,
    registerItem: list.register,
  });
  $effect(() => {
    if (hiddenUntilFound && keepMountedProp === false) {
      warnOnce(
        'The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.',
      );
    }
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
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = resolved;
    return {
      ...mergeComponentProps(
        rootState,
        { class: className, style },
        [
          {
            'data-disabled': disabled ? '' : undefined,
            'data-orientation': orientation,
          },
          attributes,
        ],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, rootState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
