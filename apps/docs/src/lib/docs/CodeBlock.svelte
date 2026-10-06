<!-- Adapted Base UI docs/src/components/CodeBlock/CodeBlock.tsx Root/Panel/Content at47b40521; MIT2019 Material-UI SAS. -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import copy from 'clipboard-copy';
  import CodeContent from './CodeContent.svelte';
  import Icons from './Icons.svelte';
  import ScrollArea from './ScrollArea.svelte';
  let {
    code,
    title = 'Code',
    inline = false,
    fileName,
    language,
  }: {
    code: string;
    title?: string;
    inline?: boolean;
    fileName?: string;
    language?: string;
  } = $props();
  const uid = $props.id();
  const codeId = uid + '-code';
  const titleId = uid + '-title';
  let copyTimeout = $state<ReturnType<typeof setTimeout> | undefined>();
  async function copyCode() {
    const root = document.getElementById(codeId);
    const value = root?.querySelector('pre code')?.textContent ?? root?.textContent;
    if (value) {
      await copy(value);
      const newTimeout = setTimeout(() => {
        clearTimeout(newTimeout);
        copyTimeout = undefined;
      }, 2000);
      clearTimeout(copyTimeout);
      copyTimeout = newTimeout;
    }
  }
  onDestroy(() => clearTimeout(copyTimeout));
  function selectAll(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
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

<div role="figure" aria-labelledby={titleId} class="CodeBlockRoot">
  <div class="CodeBlockPanel">
    <div id={titleId} class="CodeBlockPanelTitle">{title}</div>
    <button
      type="button"
      class="GhostButton"
      data-layout="icon"
      aria-label="Copy code"
      onclick={copyCode}
      ><span class="CodeBlockCopyIcon"><Icons name={copyTimeout ? 'check' : 'copy'} /></span
      ></button
    >
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions (Source selection shortcut bubbles from the focusable scroll viewport.) -->
  <div onkeydown={selectAll} role="group">
    <ScrollArea
      class="CodeBlockPreContainer"
      viewportClass="CodeBlockViewport"
      orientation="horizontal"
      id={codeId}
      tabindex={-1}
    >
      <pre class={['CodeBlockPreInline', !inline && 'CodeBlockPre']}
        ><code><CodeContent {code} fileName={fileName ?? title} {language} /></code></pre
      >
    </ScrollArea>
  </div>
</div>
