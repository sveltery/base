<script lang="ts" generics="Payload = unknown">
  // Original MenuRoot provider/handle/tree composition with native Svelte snippets (MIT).
  import { onDestroy, untrack } from 'svelte';
  import { createMenuRoot } from './root/createMenuRoot.svelte.js';
  import { provideMenuRootContext, type MenuRootContext } from './root/MenuRootContext.js';
  import { provideFloatingTree } from '../floating-ui/components/FloatingTree.svelte.js';
  import PopupHandleAttachment from '../utils/popups/PopupHandleAttachment.svelte';
  import type { MenuRootProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let { actions = $bindable(null), ...props }: MenuRootProps<Payload> = $props();
  const id = $props.id();
  const root = createMenuRoot<Payload>(() => props, `${id}-root`, `${id}-floating`);
  provideMenuRootContext({ store: root.store, parent: root.parent } as MenuRootContext);
  if (root.parent.type === undefined || root.parent.type === 'context-menu') {
    provideFloatingTree(untrack(() => root.store.select('floatingTreeRoot')));
  }
  export function close() { root.close(); }
  export function unmount() { root.unmount(); }
  // eslint-disable-next-line no-useless-assignment -- Native bind:actions replaces the Source actionsRef output.
  actions = { close, unmount };
  onDestroy(() => { actions = null; });
</script>
{#if props.handle}<PopupHandleAttachment handle={props.handle} store={root.store} />{/if}
{@render props.children?.({ payload: root.payload })}
