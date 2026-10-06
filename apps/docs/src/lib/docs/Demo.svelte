<!-- Adapted Base UI docs/src/components/Demo/Demo.tsx and DemoPlayground at47b40521; MIT2019 Material-UI SAS. One actual Svelte source file; React variant/export branches are deferred. -->
<script lang="ts">
  import { Collapsible } from '@sveltery/base/collapsible';
  import { tick } from 'svelte';
  import type { Snippet } from 'svelte';
  import DemoCodeBlock from './DemoCodeBlock.svelte';
  import { ScrollArea } from '@sveltery/base/scroll-area';
  let {
    children,
    code,
    title = 'Example.svelte',
  }: { children?: Snippet; code: string; title?: string } = $props();
  let expanded = $state(false);
  let collapsibleTriggerRef = $state<HTMLElement | null>(null);
  async function openChange(nextOpen: boolean) {
    if (!nextOpen && collapsibleTriggerRef) {
      const buttonVisualEl = collapsibleTriggerRef;
      const rectTopBeforeClose = buttonVisualEl.getBoundingClientRect().top;
      expanded = nextOpen;
      await tick();
      const rectTopAfterClose = buttonVisualEl.getBoundingClientRect().top;
      const delta = rectTopAfterClose - rectTopBeforeClose;
      if (rectTopAfterClose < 0)
        buttonVisualEl.ownerDocument.defaultView?.scrollBy({
          top: delta,
          behavior: 'instant',
        });
      return;
    }
    expanded = nextOpen;
  }
</script>

<div class="DemoRoot">
  <div class="DemoPlayground">
    <div role="figure" aria-label="Component demo" data-demo="svelte" class="DemoPlaygroundInner">
      <svelte:boundary>
        {@render children?.()}{#snippet failed(_error, reset)}<p>
            Example could not render. <button type="button" onclick={reset}>Try again</button>
          </p>{/snippet}
      </svelte:boundary>
    </div>
  </div>
  <Collapsible.Root class="DemoCollapsibleRoot" open={expanded} onOpenChange={openChange}>
    <div role="figure" aria-label="Component demo code">
      <div class="DemoToolbar">
        <ScrollArea.Root class="DemoToolbarScrollAreaRoot"
          ><ScrollArea.Viewport class="DemoToolbarViewport"
            ><div class="DemoTabsRoot">
              <div class="DemoTabsList">
                <span class="DemoTab" data-active>{title}</span>
              </div>
            </div></ScrollArea.Viewport
          ></ScrollArea.Root
        >
      </div>
      <DemoCodeBlock {code} collapsibleOpen={expanded} bind:collapsibleTriggerRef />
    </div>
  </Collapsible.Root>
</div>
