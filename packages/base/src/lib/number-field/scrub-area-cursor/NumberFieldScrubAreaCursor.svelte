<script lang="ts">
  import { untrack } from 'svelte';
  // Base UI v1.8.0 NumberFieldScrubAreaCursor.tsx composition (MIT).
  import { platform } from '@sveltery/utils/platform';
  import { ownerDocument } from '@sveltery/utils/owner';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { useNumberFieldScrubAreaContext } from '../scrub-area/NumberFieldScrubAreaContext.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { NumberFieldScrubAreaCursorProps } from '../types.js';
  const CURSOR_STYLE = 'position:fixed;top:0;left:0;pointer-events:none';
  let {
    render,
    class: classProp,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: NumberFieldScrubAreaCursorProps = $props();
  const context = useNumberFieldRootContext();
  const scrub = useNumberFieldScrubAreaContext();
  const shouldRender = $derived(
    scrub.isScrubbing &&
      !platform.engine.webkit &&
      !scrub.isTouchInput &&
      !scrub.isPointerLockDenied,
  );
  // Move the actual native host while retaining Svelte's logical context and teardown owner.
  function portal(node: HTMLSpanElement | null) {
    if (!node) return;
    const position = node.ownerDocument.createComment('NumberField.ScrubAreaCursor');
    node.before(position);
    ownerDocument(node).body.appendChild(node);
    return () => {
      node.remove();
      position.remove();
    };
  }
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    const cursorRef = scrub.scrubAreaCursorRef;
    return untrack(() => {
      ref = host;
      cursorRef.current = host as HTMLSpanElement;
      const disposePortal = portal(host as HTMLSpanElement);
      return () =>
        untrack(() => {
          disposePortal?.();
          if (ref === host) ref = null;
          if (cursorRef.current === host) cursorRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      context.state,
      { class: classProp, style },
      [{ role: 'presentation', style: CURSOR_STYLE }, elementProps],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if shouldRender}
  {#if render}
    {@render render(mergedProps, context.state, children)}
  {:else}
    <span {...mergedProps}>{@render children?.()}</span>
  {/if}
{/if}
