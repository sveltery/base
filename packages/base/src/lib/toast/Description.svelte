<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import RenderContent from './RenderContent.svelte';
  import { root } from './root-context.js';
  import { isRenderableContent } from './content.js';
  import type { ToastDescriptionProps } from './types.js';
  let {
    render,
    children,
    id,
    ref = $bindable(),
    ...props
  }: ToastDescriptionProps = $props();
  const controller = root();
  const generated = $props.id();
  const resolvedId = $derived(id ?? `base-ui-${generated}`);
  const content = $derived(children ?? controller.toast.description);
  $effect(() => {
    if (isRenderableContent(content))
      return controller.setDescriptionId(resolvedId);
  });
  const state = $derived({ type: controller.toast.type });

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
    const { class: className, style, ...attributes } = props;
    return {
      ...mergeComponentProps(
        state,
        { class: className, style },
        [{ id: resolvedId, 'data-type': state.type }, attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if isRenderableContent(content)}
  {#snippet hostChildren()}
    <RenderContent {content} />
  {/snippet}
  {#if render}
    {@render render(mergedProps, state, hostChildren)}
  {:else}
    <p {...mergedProps}>{@render hostChildren?.()}</p>
  {/if}
{/if}
