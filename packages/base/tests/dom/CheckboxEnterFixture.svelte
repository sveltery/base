<script lang="ts">
  import { Checkbox } from '../../src/lib/checkbox/index.js';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { flushSync, onDestroy, type Snippet } from 'svelte';
  let {
    native = false,
    disabled = false,
    readOnly = false,
    ancestor = 'none',
    submit,
    change,
  }: {
    native?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    ancestor?: 'none' | 'prevent' | 'stop';
    submit?: () => void;
    change?: () => void;
  } = $props();
  let mounted = $state(true);
  export function hide() {
    mounted = false;
  }
  let stopUnmountAfterTarget = () => {};
  export function armUnmountAfterTarget() {
    // Installed after mounting: Svelte's target delegation runs before this document listener.
    const handler = () => flushSync(() => (mounted = false));
    document.addEventListener('keydown', handler, { once: true });
    stopUnmountAfterTarget = () => document.removeEventListener('keydown', handler);
  }
  onDestroy(() => stopUnmountAfterTarget());
  function ancestorEvents(element: HTMLDivElement) {
    const handler = (event: KeyboardEvent) => {
      if (ancestor === 'prevent') event.preventDefault();
      if (ancestor === 'stop') event.stopPropagation();
    };
    element.addEventListener('keydown', handler);
    return () => element.removeEventListener('keydown', handler);
  }
</script>

{#snippet button(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}<button {...props as HTMLButtonAttributes}>{@render children?.()}</button>{/snippet}
<form
  onsubmit={(event) => {
    event.preventDefault();
    submit?.();
  }}
>
  <div role="group" {@attach ancestorEvents}>
    {#if mounted}<Checkbox.Root
        {disabled}
        {readOnly}
        nativeButton={native}
        render={native ? button : undefined}
        onCheckedChange={() => change?.()}
        name="first"
      />{/if}
    <Checkbox.Root name="second" data-second />
  </div>
  <button type="submit" name="intent" value="save">Save</button>
</form>
