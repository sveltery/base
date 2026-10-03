<script lang="ts">
  // Native input composition for the pinned Slider hidden range input (MIT).
  import { on } from "svelte/events";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { HTMLProps } from "../../internals/types.js";
  let { supplied }: { supplied: HTMLProps } = $props();

  // The original composed handler reads the native edit before binding restores
  // its authoritative value after cancellation or a rejected controlled update.
  function listenInput(node: HTMLInputElement, getHandler: () => unknown) {
    return {
      destroy: on(node, "input", (event) => {
        const handler = getHandler() as ((event: Event) => void) | undefined;
        handler?.(event);
      }),
    };
  }
</script>

<input
  {...{ ...supplied, oninput: undefined } as HTMLInputAttributes}
  use:listenInput={() => supplied.oninput}
  bind:value={() => supplied.value as number, () => undefined}
/>
