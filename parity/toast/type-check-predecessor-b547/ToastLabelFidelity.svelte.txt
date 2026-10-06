<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Toast } from '@sveltery/base';
  import type { ToastContent } from '@sveltery/base/toast';
  let { sameId = true, customRender = false }: { sameId?: boolean; customRender?: boolean } =
    $props();
  let old = $state(true);
  let newer = $state(false);
  let oldContent = $state<ToastContent | undefined>('Old label');
  let newContent = $state<ToastContent | undefined>('New label');
  let rendered = $state(true);
  function setLabels(options: {
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

<button onclick={() => setLabels({ newer: true })}>show newer</button>
<button onclick={() => setLabels({ old: false })}>remove older</button>
<button onclick={() => setLabels({ old: true })}>restore older</button>
<button onclick={() => setLabels({ newContent: 'Changed visible text' })}>change newer text</button>
<button onclick={() => setLabels({ newContent: '' })}>empty newer</button>
<button onclick={() => setLabels({ newContent: 0 })}>zero newer</button>
<button onclick={() => setLabels({ rendered: false })}>hide custom host</button>
<button onclick={() => setLabels({ rendered: true })}>show custom host</button>
<button onclick={() => setLabels({ oldContent: false })}>false older</button>
<button onclick={() => setLabels({ oldContent: null })}>fallback older</button>
