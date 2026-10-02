<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import RenderContent from './RenderContent.svelte';
  import { root } from './root-context.js';
  import { isRenderableContent } from './content.js';
  import type { ToastTitleProps } from './types.js';
  let { children, id, ref = $bindable(), ...props }: ToastTitleProps = $props();
  const controller = root();
  const generated = $props.id();
  const resolvedId = $derived(id ?? `base-ui-${generated}`);
  const content = $derived(children ?? controller.toast.title);
  $effect(() => {
    if (isRenderableContent(content)) return controller.setTitleId(resolvedId);
  });
  const state = $derived({ type: controller.toast.type });
</script>
{#if isRenderableContent(content)}
  <Element tag="h2" internal={{ id: resolvedId, 'data-type': state.type }} {props} {state} bind:ref>
    <RenderContent {content} />
  </Element>
{/if}
