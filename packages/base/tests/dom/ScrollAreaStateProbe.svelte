<script lang="ts">
  // Source R:951 business identity witness under native Svelte effect semantics; MIT.
  import { useScrollAreaRootContext } from '../../src/lib/scroll-area/root/ScrollAreaRootContext.js';
  let { observe }: { observe: (state: object) => void } = $props();
  const root = useScrollAreaRootContext();
  $effect(() => { observe(root.cornerSize); });
</script>
