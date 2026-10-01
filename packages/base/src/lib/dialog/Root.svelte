<script lang="ts">
  import { onDestroy, setContext } from 'svelte';
  import { DialogController } from './controller.svelte.js';
  import { ROOT, root } from './context.js';
  import type { RootProps } from './types.js';
  let { actions = $bindable(null), ...props }: RootProps = $props();
  const id = $props.id();
  const controller = new DialogController(() => props, `base-ui-${id}`, root(true));
  setContext(ROOT, controller);
  // Exported component methods also work with bind:this without a DOM ref.
  export function close() { controller.request(false, 'imperative-action'); }
  export function unmount() { controller.deferred = false; controller.presence = false; }
  actions = { close, unmount };
  onDestroy(() => { controller.destroy(); actions = null; });
</script>
{@render props.children?.()}
