<!-- Adapted Base UI docs/src/components/Demo/DemoCodeBlock.tsx at47b40521; MIT2019 Material-UI SAS. -->
<script lang="ts">
  import { Collapsible } from '@sveltery/base/collapsible';
  import { ScrollArea } from '@sveltery/base/scroll-area';
  import copy from 'clipboard-copy';
  import { onDestroy } from 'svelte';
  import CodeContent from './CodeContent.svelte';
  import Icons from './Icons.svelte';
  let {
    code,
    collapsibleOpen,
    collapsibleTriggerRef = $bindable<HTMLElement | null>(null),
    collapsibleLinesThreshold = 8,
  }: {
    code: string;
    collapsibleOpen: boolean;
    collapsibleTriggerRef?: HTMLElement | null;
    collapsibleLinesThreshold?: number;
  } = $props();
  const selectedFileLines = $derived(code.split(/\r?\n|\r/).length);
  let copyTimeout = $state<ReturnType<typeof setTimeout> | undefined>();
  async function copyCode() {
    await copy(code);
    const newTimeout = setTimeout(() => {
      clearTimeout(newTimeout);
      copyTimeout = undefined;
    }, 2000);
    clearTimeout(copyTimeout);
    copyTimeout = newTimeout;
  }
  onDestroy(() => clearTimeout(copyTimeout));
  function selectAll(event: KeyboardEvent) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'a' &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      window.getSelection()?.selectAllChildren(event.currentTarget as Node);
    }
  }
</script>

{#snippet source()}
  <div class="DemoSourceBrowser">
    <pre><code><CodeContent {code} fileName="Example.svelte" /></code></pre>
  </div>
{/snippet}
{#snippet copyButton()}
  <button
    type="button"
    class="GhostButton DemoCodeBlockCopyButton"
    data-layout="icon"
    aria-label="Copy code"
    onclick={copyCode}><Icons name={copyTimeout ? 'check' : 'copy'} /></button
  >
{/snippet}
{#if selectedFileLines < collapsibleLinesThreshold}
  <ScrollArea.Root
    class="DemoCodeBlockRoot"
    tabindex={-1}
    onkeydown={selectAll}
  >
    <ScrollArea.Viewport class="ScrollAreaViewport"
      >{@render source()}</ScrollArea.Viewport
    >
    <ScrollArea.Corner /><ScrollArea.Scrollbar class="ScrollAreaScrollbar"
      ><ScrollArea.Thumb class="ScrollAreaThumb" /></ScrollArea.Scrollbar
    ><ScrollArea.Scrollbar orientation="horizontal" class="ScrollAreaScrollbar"
      ><ScrollArea.Thumb class="ScrollAreaThumb" /></ScrollArea.Scrollbar
    >{@render copyButton()}
  </ScrollArea.Root>
{:else}
  <div class="DemoCodeBlockCollapsible">
    <ScrollArea.Root
      class="DemoCodeBlockRoot"
      tabindex={-1}
      data-closed={collapsibleOpen ? undefined : ''}
      onkeydown={selectAll}
    >
      <Collapsible.Panel keepMounted hidden={false}>
        {#snippet render(props, _state, children)}
          <ScrollArea.Viewport
            {...props}
            class="ScrollAreaViewport DemoCodeBlockViewport"
            aria-hidden={!collapsibleOpen}
            data-closed={collapsibleOpen ? undefined : ''}
            {...!collapsibleOpen && { tabindex: undefined }}
          >
            {#snippet render(viewportProps, _viewportState, viewportChildren)}
              <div
                {...viewportProps}
                style:overflow={collapsibleOpen ? 'scroll' : undefined}
              >{@render viewportChildren?.()}</div>
            {/snippet}
          </ScrollArea.Viewport>
        {/snippet}
        {@render source()}
      </Collapsible.Panel>
      {#if collapsibleOpen}<ScrollArea.Corner /><ScrollArea.Scrollbar
          class="ScrollAreaScrollbar"
          ><ScrollArea.Thumb class="ScrollAreaThumb" /></ScrollArea.Scrollbar
        ><ScrollArea.Scrollbar
          orientation="horizontal"
          class="ScrollAreaScrollbar"
          ><ScrollArea.Thumb class="ScrollAreaThumb" /></ScrollArea.Scrollbar
        >{/if}
      {@render copyButton()}
      <Collapsible.Trigger
        class="DemoCollapseButton"
        data-sticky={collapsibleOpen ? '' : undefined}
        ><span
          bind:this={collapsibleTriggerRef}
          class="DemoCollapseButtonVisual"
          >{collapsibleOpen ? 'Hide code' : 'Show code'}</span
        ></Collapsible.Trigger
      >
    </ScrollArea.Root>
  </div>
{/if}
