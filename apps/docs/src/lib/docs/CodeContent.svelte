<!-- Native Svelte rendering replaces infra hastToJsx/toJsxRuntime; actual Source
parseSource, token and gutter bodies produce the same selected span/text tree.
Deferred plain-text line/frame fallback remains SSR-visible; React provider,
compression/transform/editor branches remain outside this bounded renderer. -->
<script lang="ts">
  import { parsePlainText } from './highlight/plainText.js';
  import { resolveGrammarScope } from './highlight/grammarMaps.js';
  import { ensureGrammars } from './highlight/grammarCache.js';
  import type { HastRoot, HastNode } from './highlight/types.js';
  let { code, fileName, language }: { code: string; fileName?: string; language?: string } =
    $props();
  let highlighted = $state.raw<{
    source: string;
    fileName?: string;
    language?: string;
    tree: HastRoot;
  }>();
  const tree = $derived(
    highlighted?.source === code &&
      highlighted.fileName === fileName &&
      highlighted.language === language
      ? highlighted.tree
      : parsePlainText(code),
  );
  $effect(() => {
    const source = code;
    const name = fileName;
    const lang = language;
    const scope = resolveGrammarScope(name, lang);
    if (!scope) return;
    let cancelled = false;
    void (async () => {
      try {
        await ensureGrammars([scope]);
        const { parseSource } = await import('./highlight/parseSource.js');
        const tree = parseSource(source, name, lang);
        if (!cancelled) highlighted = { source, fileName: name, language: lang, tree };
      } catch {
        // Source convention: chunk/grammar failure leaves the readable fallback.
      }
    })();
    return () => {
      cancelled = true;
    };
  });
</script>

{#snippet nodes(children: HastNode[])}
  {#each children as node (node)}
    {#if node.type === 'text'}{node.value}{:else if node.type === 'element'}<span
        class={node.properties.className}
        data-ln={node.properties.dataLn}
        data-lined={node.properties.dataLined}
        data-frame-type={node.properties.dataFrameType}
        data-frame-indent={node.properties.dataFrameIndent}
        data-frame-truncated={node.properties.dataFrameTruncated}
        >{@render nodes(node.children)}</span
      >{/if}
  {/each}
{/snippet}
{@render nodes(tree.children)}
