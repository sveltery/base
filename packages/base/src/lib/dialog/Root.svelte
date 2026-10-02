<script lang="ts" generics="Payload = unknown">
  import { onDestroy, setContext, untrack } from 'svelte';
  import HandleAttachment from './HandleAttachment.svelte';
  import { DialogController } from './controller.svelte.js';
  import { ROOT, root } from './context.js';
  import type { RootProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Bindable assignment publishes the actions to the owner.
  let { actions = $bindable(null), ...props }: RootProps<Payload> = $props();
  const id = $props.id();
  const controller = new DialogController(() => props, `base-ui-${id}`, root(true));
  setContext(ROOT, controller);
  $effect(() => { controller.reconcileTrigger(); });
  $effect(() => { const open = controller.open; untrack(() => controller.synchronizeOpen(open)); });
  // Exported component methods also work with bind:this without a DOM ref.
  export function close() { controller.request(false, 'imperative-action'); }
  export function unmount() { controller.unmount(); }
  // eslint-disable-next-line no-useless-assignment -- Svelte bind:actions observes this assignment externally.
  actions = { close, unmount };
  onDestroy(() => { controller.destroy(); actions = null; });
</script>
{#if props.handle}<HandleAttachment handle={props.handle} {controller}/>{/if}
{@render props.children?.({ payload: controller.payload as Payload | undefined })}
