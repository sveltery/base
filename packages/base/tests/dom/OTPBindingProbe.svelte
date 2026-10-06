<script lang="ts">
  import { untrack } from 'svelte';
  import { on } from 'svelte/events';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let {
    bound = false,
    cancel = false,
    initial = '12',
    onChange,
  }: {
    bound?: boolean;
    cancel?: boolean;
    initial?: string;
    onChange?: (value: string) => void;
  } = $props();
  let whole = $state(untrack(() => initial));
  const hostProps = $derived({
    value: whole[0] ?? '',
    oninput(event: Event) {
      const next = (event.currentTarget as HTMLInputElement).value;
      onChange?.(next);
      if (!cancel) whole = next;
    },
  });
  function listenInput(node: HTMLInputElement, getHandler: () => (event: Event) => void) {
    return { destroy: on(node, 'input', (event) => getHandler()(event)) };
  }
  export function value() {
    return whole;
  }
</script>

{#if bound}
  <input
    {...{ ...hostProps, oninput: undefined } as HTMLInputAttributes}
    use:listenInput={() => hostProps.oninput}
    bind:value={() => whole[0] ?? '', () => undefined}
  />
{:else}
  <input {...hostProps as HTMLInputAttributes} />
{/if}
