<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePopoverRootContext } from './context.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import type { PopoverDescriptionProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
  let { render, class: className, style, children, ref = $bindable(), ...elementProps }: PopoverDescriptionProps = $props();
  const store = usePopoverRootContext();
  const generatedId = $props.id();
  const id = $derived(useBaseUiId(elementProps.id ?? undefined, generatedId));
  store.useSyncedValueWithCleanup('descriptionElementId', () => id);
  const forwardedRef = (node: HTMLElement | null) => { ref = node; };
</script>
<RenderElement tag="p" componentProps={{ render, class: className, style }} params={{ ref: forwardedRef, props: [{ id }, elementProps] }} {children} />
