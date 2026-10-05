<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Adapted from pinned MeterRoot; MIT: THIRD_PARTY_NOTICES.md.
  import { visuallyHidden } from '@sveltery/utils/visuallyHidden';
  import { toNativeStyle } from '../internals/nativeProps.js';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { setMeterContext } from './context.js';
  import { emptyState, normalize } from './helpers.js';
  import type { MeterRootProps } from './types.js';
  let { value, min = 0, max = 100, format, locale, getAriaValueText, children, render, class: classProp, ref = $bindable(), ...props }: MeterRootProps = $props();
  let labelId = $state<string>();
  const normalized = $derived(normalize(value, min, max, locale, format));
  const partState = emptyState;
  setMeterContext({
    get value() { return value; },
    get percentageValue() { return normalized.percentageValue; }, get formattedValue() { return normalized.formattedValue; },
    setLabelId(id) { labelId = typeof id === 'function' ? id(labelId) : id; },
  });
  const internal = $derived({
    role: 'meter', 'aria-labelledby': labelId,
    'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': normalized.clampedValue,
    'aria-valuetext': getAriaValueText ? getAriaValueText(normalized.formattedValue, value) : normalized.formattedValue,
  });
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(partState) : classProp) });

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived.by(() => {
  const { class: className, style, ...attributes } = resolved;
  return { ...mergeComponentProps(partState, { class: className, style }, [internal, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#snippet content()}{@render children?.()}<span role="presentation" style={toNativeStyle(visuallyHidden)}>x</span>{/snippet}
{#if render}
  {@render render(mergedProps, partState, content)}
{:else}
  <div {...mergedProps}>{@render content?.()}</div>
{/if}
