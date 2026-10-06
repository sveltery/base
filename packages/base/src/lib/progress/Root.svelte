<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned ProgressRoot; MIT: THIRD_PARTY_NOTICES.md.
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import { setProgressContext } from './context.js';
  import { normalize, statusAttributes } from './helpers.js';
  import type { ProgressRootProps } from './types.js';
  let {
    value,
    min = 0,
    max = 100,
    format,
    locale,
    getAriaValueText,
    children,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: ProgressRootProps = $props();
  let labelId = $state<string>();
  const normalized = $derived(normalize(value, min, max, locale, format));
  const partState = $derived(normalized.state);
  setProgressContext({
    get value() {
      return value;
    },
    get state() {
      return partState;
    },
    get percentageValue() {
      return normalized.percentageValue;
    },
    get formattedValue() {
      return normalized.formattedValue;
    },
    setLabelId(id) {
      labelId = typeof id === 'function' ? id(labelId) : id;
    },
  });
  const internal = $derived({
    ...statusAttributes(partState.status),
    role: 'progressbar',
    'aria-labelledby': labelId,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': normalized.clampedValue ?? undefined,
    'aria-valuetext': getAriaValueText
      ? getAriaValueText(normalized.formattedValue, value)
      : normalized.defaultAriaValueText,
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
    ...mergeComponentProps(partState, { class: classProp, style }, [internal, props], false),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet content()}{@render children?.()}<span
    role="presentation"
    style={toNativeStyle(visuallyHidden)}>x</span
  >{/snippet}
{#if render}
  {@render render(mergedProps, partState, content)}
{:else}
  <div {...mergedProps}>{@render content?.()}</div>
{/if}
