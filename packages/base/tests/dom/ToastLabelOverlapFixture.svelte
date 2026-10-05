<script lang="ts">
  import type { Snippet } from 'svelte';
  import * as Toast from '../../src/lib/toast/index.js';
  import type { ToastContent } from '../../src/lib/toast/types.js';
  let { sameId = true, customRender = false }: { sameId?: boolean; customRender?: boolean } =
    $props();
  let old = $state(true);
  let newer = $state(false);
  let oldContent = $state<ToastContent>('Old label');
  let newContent = $state<ToastContent>('New label');
  let rendered = $state(true);
  export function setLabels(options: {
    old?: boolean;
    newer?: boolean;
    oldContent?: ToastContent;
    newContent?: ToastContent;
    rendered?: boolean;
  }) {
    if ('old' in options) old = options.old!;
    if ('newer' in options) newer = options.newer!;
    if ('oldContent' in options) oldContent = options.oldContent;
    if ('newContent' in options) newContent = options.newContent;
    if ('rendered' in options) rendered = options.rendered!;
  }
</script>

{#snippet titleHost(props: Record<string | symbol, unknown>, _state: unknown, children?: Snippet)}
  {#if rendered}<h3 {...props}>{@render children?.()}</h3>{/if}
{/snippet}
{#snippet descriptionHost(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children?: Snippet,
)}
  {#if rendered}<section {...props}>{@render children?.()}</section>{/if}
{/snippet}
<Toast.Provider timeout={0}>
  <Toast.Viewport>
    <Toast.Root
      toast={{ id: 'labels', title: 'Fallback title', description: 'Fallback description' }}
      swipeDirection={[]}
      data-testid="label-root"
    >
      {#if old}
        <Toast.Title
          id={sameId ? 'shared-title' : 'old-title'}
          data-testid="old-title"
          children={oldContent}
          render={customRender ? titleHost : undefined}
        />
        <Toast.Description
          id={sameId ? 'shared-description' : 'old-description'}
          data-testid="old-description"
          children={oldContent}
          render={customRender ? descriptionHost : undefined}
        />
      {/if}
      {#if newer}
        <Toast.Title
          id={sameId ? 'shared-title' : 'new-title'}
          data-testid="new-title"
          children={newContent}
        />
        <Toast.Description
          id={sameId ? 'shared-description' : 'new-description'}
          data-testid="new-description"
          children={newContent}
        />
      {/if}
    </Toast.Root>
  </Toast.Viewport>
</Toast.Provider>
