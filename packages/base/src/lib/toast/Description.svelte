<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import RenderContent from './RenderContent.svelte';
  import { root } from './root-context.js';
  import { isRenderableContent } from './content.js';
  import type { ToastDescriptionProps } from './types.js';
  let { children, id, ref = $bindable(null), ...props }: ToastDescriptionProps = $props();
  const controller = root();
  const generated = $props.id();
  const resolvedId = $derived(id ?? `base-ui-${generated}`);
  const content = $derived(children ?? controller.toast.description);
  $effect(() => {
    if (isRenderableContent(content)) return controller.setDescriptionId(resolvedId);
  });
  const state = $derived({ type: controller.toast.type });
</script>
{#if isRenderableContent(content)}
  <Element tag="p" internal={{ id: resolvedId, 'data-type': state.type }} {props} {state} bind:ref>
    <RenderContent {content} />
  </Element>
{/if}
