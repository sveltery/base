<script lang="ts" generics="State extends object, Host extends Element = Element">
  // Native markup/attachment boundary for the used pinned source useRenderElement closure (MIT).
  import { untrack, type Snippet } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { BROWSER } from 'esm-env';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { createRenderElement, type UseRenderElementComponentProps, type UseRenderElementParameters } from './useRenderElement.js';
  import { createRefAttachment } from './nativeRefAttachment.js';
  import { toNativeStyle } from './nativeProps.js';
  let { tag = 'div', componentProps = {}, params = {}, element = $bindable(), children }: {
    tag?: string;
    componentProps?: UseRenderElementComponentProps<State>;
    params?: UseRenderElementParameters<State, Host>;
    element?: Host | null;
    children?: Snippet;
  } = $props();
  const renderer = createRenderElement<Host>();
  const attachmentKey = createAttachmentKey();
  const referenceAttachment = createRefAttachment<Host>((node, previous) => untrack(() => {
    if (node !== null || element === previous) element = node;
  }));
  const output = $derived.by(() => {
    const descriptor = renderer.useRenderElement(tag, componentProps, params);
    if (!descriptor) return undefined;
    const { ref, ...attributes } = descriptor.props;
    const { children: propsChildren, ...hostAttributes } = attributes;
    const attachment = BROWSER ? referenceAttachment(ref ?? null) : undefined;
    const nativeProps = descriptor.render ? attributes : hostAttributes;
    return {
      ...descriptor,
      attachment,
      children: children ?? propsChildren as Snippet | undefined,
      props: {
        ...nativeProps,
        ...(attributes.style !== undefined ? { style: toNativeStyle(attributes.style) } : {}),
        [attachmentKey]: attachment,
      },
    };
  });
</script>
{#if output}
  {#if output.render}
    {@render output.render(output.props, output.state, output.children)}
  {:else if output.tag === 'input'}
    <!-- The literal host lets Svelte own input spread/default/hydration semantics. -->
    <input {...output.props as HTMLInputAttributes} />
  {:else}
    <svelte:element this={output.tag!} {...output.props}>{@render output.children?.()}</svelte:element>
  {/if}
{/if}
