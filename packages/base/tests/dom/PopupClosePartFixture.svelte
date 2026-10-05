<script lang="ts">
  import { setContext } from 'svelte';
  import { ClosePartContext, useClosePartCount } from '../../src/lib/utils/closePart.svelte.js';
  import Child from './PopupClosePartChild.svelte';

  const count = useClosePartCount();
  setContext(ClosePartContext, count.context);

  let first = $state(false);
  let second = $state(false);

  export function setChildren(nextFirst: boolean, nextSecond: boolean) {
    first = nextFirst;
    second = nextSecond;
  }

  export function register() {
    return count.context.register();
  }

  export function hasClosePart() {
    return count.hasClosePart;
  }
</script>

<output data-has-close>{String(count.hasClosePart)}</output>
{#if first}<Child />{/if}
{#if second}<Child />{/if}
