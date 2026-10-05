<script lang="ts">
  // Adapted from pinned MeterRoot; MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { setMeterContext } from './context.js';
  import { emptyState, normalize, visuallyHidden } from './helpers.js';
  import type { MeterRootProps } from './types.js';
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
    ref = $bindable(),
    ...props
  }: MeterRootProps = $props();
  let labelId = $state<string>();
  const normalized = $derived(normalize(value, min, max, locale, format));
  const partState = emptyState;
  setMeterContext({
    get value() {
      return value;
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
    role: 'meter',
    'aria-labelledby': labelId,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': normalized.clampedValue,
    'aria-valuetext': getAriaValueText
      ? getAriaValueText(normalized.formattedValue, value)
      : normalized.formattedValue,
  });
  const resolved = $derived({
    ...props,
    class: resolveClassValue(typeof classProp === 'function' ? classProp(partState) : classProp),
  });
</script>

{#snippet content()}{@render children?.()}<span role="presentation" style={visuallyHidden}>x</span
  >{/snippet}
<Element
  tag="div"
  {internal}
  props={resolved}
  state={partState}
  {render}
  children={content}
  bind:ref
/>
