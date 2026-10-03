<script lang="ts">
  // Base UI v1.8.0 NumberFieldScrubAreaCursor.tsx composition (MIT).
  import { platform } from '../../utils/platform/index.js';
  import { ownerDocument } from '../../utils/owner.js';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { useNumberFieldScrubAreaContext } from '../scrub-area/NumberFieldScrubAreaContext.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import type { NumberFieldScrubAreaCursorProps } from '../types.js';
  const CURSOR_STYLE = 'position:fixed;top:0;left:0;pointer-events:none';
  let { render, class: classProp, style, children, ref = $bindable(), ...elementProps }: NumberFieldScrubAreaCursorProps = $props();
  const context = useNumberFieldRootContext();
  const scrub = useNumberFieldScrubAreaContext();
  const shouldRender = $derived(scrub.isScrubbing && !platform.engine.webkit && !scrub.isTouchInput && !scrub.isPointerLockDenied);
  // Move the actual native host while retaining Svelte's logical context and teardown owner.
  function portal(node: HTMLSpanElement | null) {
    if (!node) return;
    const position = node.ownerDocument.createComment('NumberField.ScrubAreaCursor');
    node.before(position);
    ownerDocument(node).body.appendChild(node);
    return () => { node.remove(); position.remove(); };
  }
</script>
<RenderElement tag="span" componentProps={{ render, class: classProp, style }} params={{ enabled: shouldRender, ref: [scrub.scrubAreaCursorRef, portal], state: context.state, props: [{ role: 'presentation', style: CURSOR_STYLE }, elementProps], stateAttributesMapping }} bind:element={ref}>{@render children?.()}</RenderElement>
