<script lang="ts">
  // Native input composition for the pinned OTP Root/Input business handlers (MIT).
  import { on } from "svelte/events";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { HTMLProps } from "../../internals/types.js";

  let { supplied }: { supplied: HTMLProps } = $props();

  // Register the composed handler before Svelte installs binding. Trusted browser
  // events can yield microtasks between listeners; the handler must read the edit first.
  function listenInput(node: HTMLInputElement, getHandler: () => unknown) {
    return {
      destroy: on(node, "input", (event) => {
        const handler = getHandler() as ((event: Event) => void) | undefined;
        handler?.(event);
      }),
    };
  }
</script>

<!-- The existing composed handler alone mutates the whole code. Native binding reads
     its authoritative merged value, including unchanged normalization or cancellation. -->
<input {...{ ...supplied, oninput: undefined } as HTMLInputAttributes}
  use:listenInput={() => supplied.oninput}
  bind:value={() => supplied.value as string, () => undefined} />
