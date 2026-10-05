<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Toast } from '../../src/lib/toast/index.js';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  import type { ToastRootState, ToastViewportState, ToastContentState, ToastLabelState } from '../../src/lib/toast/types.js';
  let { custom = true }: { custom?: boolean } = $props();
  let present = $state(true);
  let viewport = $state<HTMLElement | null>();
  let root = $state<HTMLElement | null>();
  let content = $state<HTMLElement | null>();
  let title = $state<HTMLElement | null>();
  let description = $state<HTMLElement | null>();
  let action = $state<HTMLElement | null>();
  let close = $state<HTMLElement | null>();
  const received: { id: unknown; state: unknown; children: unknown }[] = [];
  function observe(props: HTMLProps, state: unknown, children: unknown) { received.push({ id: props.id, state, children }); return mergeProps(props, { class: 'owned-toast' }); }
  export function snapshot() { return { viewport, root, content, title, description, action, close, received }; }
  export function hide() { present = false; }
</script>
{#snippet rootHost(props: HTMLProps, state: ToastRootState, children: Snippet | undefined)}<section {...observe(props, state, children)}>{@render children?.()}</section>{/snippet}
{#snippet viewportHost(props: HTMLProps, state: ToastViewportState, children: Snippet | undefined)}<section {...observe(props, state, children)}>{@render children?.()}</section>{/snippet}
{#snippet contentHost(props: HTMLProps, state: ToastContentState, children: Snippet | undefined)}<article {...observe(props, state, children)}>{@render children?.()}</article>{/snippet}
{#snippet titleHost(props: HTMLProps, state: ToastLabelState, children: Snippet | undefined)}<h4 {...observe(props, state, children)}>{@render children?.()}</h4>{/snippet}
{#snippet descriptionHost(props: HTMLProps, state: ToastLabelState, children: Snippet | undefined)}<article {...observe(props, state, children)}>{@render children?.()}</article>{/snippet}
{#snippet buttonHost(props: HTMLProps, state: ToastLabelState, children: Snippet | undefined)}<button {...observe(props, state, children)}>{@render children?.()}</button>{/snippet}
<Toast.Provider timeout={0}>
  {#if present}
    <Toast.Viewport id="native-toast-viewport" bind:ref={viewport} render={custom ? viewportHost : undefined}>
      <Toast.Root toast={{ id: 'native-toast', title: 'Toast title', description: 'Toast description', type: 'success', actionProps: { children: 'From toast' } }} swipeDirection={[]} id="native-toast-root" bind:ref={root} render={custom ? rootHost : undefined}>
        <Toast.Content id="native-toast-content" bind:ref={content} render={custom ? contentHost : undefined}>
          <Toast.Title id="native-toast-title" bind:ref={title} render={custom ? titleHost : undefined} />
          <Toast.Description id="native-toast-description" bind:ref={description} render={custom ? descriptionHost : undefined} />
          <Toast.Action id="native-toast-action" bind:ref={action} render={custom ? buttonHost : undefined} children="From component" />
          <Toast.Close id="native-toast-close" bind:ref={close} render={custom ? buttonHost : undefined}>Close toast</Toast.Close>
        </Toast.Content>
      </Toast.Root>
    </Toast.Viewport>
  {/if}
</Toast.Provider>
