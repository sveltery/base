<script lang="ts">
  import { Dialog } from '../../src/lib/index.js';
  type Container =
    HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined;
  let {
    container,
    nested = false,
    outerContainer,
  }: { container?: Container; nested?: boolean; outerContainer?: Container } = $props();
  export function setContainer(value: Container) {
    container = value;
  }
</script>

{#snippet childPortal()}<Dialog.Portal {container} data-testid="container-portal"
    ><span>Child</span></Dialog.Portal
  >{/snippet}
<Dialog.Root defaultOpen>
  {#if nested}<Dialog.Portal container={outerContainer} data-testid="outer-portal"
      >{@render childPortal()}</Dialog.Portal
    >
  {:else}{@render childPortal()}{/if}
</Dialog.Root>
