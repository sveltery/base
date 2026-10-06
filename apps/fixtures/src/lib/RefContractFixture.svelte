<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, Dialog, Toast } from '@sveltery/base';
  let {
    kind,
    initial,
    custom = false,
  }: { kind: string; initial?: HTMLElement | null; custom?: boolean } = $props();
  let ref = $state<HTMLElement | null | undefined>(untrack(() => initial));
  let visible = $state(true);
  export function getRef() {
    return ref;
  }
  export function hide() {
    visible = false;
  }
</script>

{#snippet replacement(props: Record<string, unknown>)}<span {...props}>Replacement</span>{/snippet}
{#if visible}
  {#if kind === 'element'}
    <!-- Bare native binding baseline for the retired generic element case. -->
    {#if custom}<span bind:this={ref}>Replacement</span>{:else}<div bind:this={ref}></div>{/if}
  {:else if kind === 'button'}<Button
      bind:ref
      nativeButton={!custom}
      render={custom ? replacement : undefined}>Button</Button
    >
  {:else if kind.startsWith('dialog-')}
    <Dialog.Root defaultOpen modal={false}>
      {#if kind === 'dialog-trigger'}<Dialog.Trigger
          bind:ref
          nativeButton={!custom}
          render={custom ? replacement : undefined}>Trigger</Dialog.Trigger
        >
      {:else if kind === 'dialog-portal'}<Dialog.Portal bind:ref>Portal</Dialog.Portal>
      {:else if kind === 'dialog-popup'}<Dialog.Portal
          ><Dialog.Popup bind:ref>Popup</Dialog.Popup></Dialog.Portal
        >
      {:else if kind === 'dialog-backdrop'}<Dialog.Backdrop bind:ref />
      {:else if kind === 'dialog-title'}<Dialog.Title bind:ref>Title</Dialog.Title>
      {:else if kind === 'dialog-description'}<Dialog.Description bind:ref
          >Description</Dialog.Description
        >
      {:else if kind === 'dialog-close'}<Dialog.Close bind:ref>Close</Dialog.Close>{/if}
    </Dialog.Root>
  {:else}
    <Toast.Provider>
      {#if kind === 'toast-viewport'}<Toast.Viewport bind:ref />
      {:else if kind === 'toast-root'}<Toast.Root
          swipeDirection={[]}
          toast={{ id: 'ref', title: 'Title' }}
          bind:ref
        />
      {:else}
        <Toast.Root
          swipeDirection={[]}
          toast={{
            id: 'ref',
            title: 'Title',
            description: 'Description',
            actionProps: { children: 'Action' },
          }}
        >
          {#if kind === 'toast-title'}<Toast.Title bind:ref />
          {:else if kind === 'toast-description'}<Toast.Description bind:ref />
          {:else if kind === 'toast-content'}<Toast.Content bind:ref>Content</Toast.Content>
          {:else if kind === 'toast-action'}<Toast.Action bind:ref />
          {:else if kind === 'toast-close'}<Toast.Close bind:ref>Close</Toast.Close>{/if}
        </Toast.Root>
      {/if}
    </Toast.Provider>
  {/if}
{/if}
