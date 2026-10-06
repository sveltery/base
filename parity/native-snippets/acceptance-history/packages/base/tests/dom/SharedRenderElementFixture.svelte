<script lang="ts">
  import type { Snippet } from 'svelte';
  import RenderElement from '../../src/lib/internals/RenderElement.svelte';
  import type { UseRenderElementParameters, UseRenderElementComponentProps } from '../../src/lib/internals/useRenderElement.js';
  let { tag = 'div', params = {}, componentProps = {}, children }: {
    tag?: string; params?: UseRenderElementParameters<Record<string, unknown>>;
    componentProps?: UseRenderElementComponentProps<Record<string, unknown>>; children?: Snippet;
  } = $props();
  let element = $state<Element | null | undefined>();
  export function setParams(next: UseRenderElementParameters<Record<string, unknown>>) { params = next; }
  export function setComponentProps(next: UseRenderElementComponentProps<Record<string, unknown>>) { componentProps = next; }
  export function setTag(next: string) { tag = next; }
  export function getElement() { return element; }
</script>
<RenderElement {tag} {params} {componentProps} {children} bind:element />
