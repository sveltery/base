<script lang="ts">
  import {
    useScrollAreaRootContext,
    type ScrollAreaRootContext,
  } from '../../src/lib/scroll-area/root/ScrollAreaRootContext.js';
  let { capture }: { capture: (context: ScrollAreaRootContext) => void } =
    $props();
  capture(useScrollAreaRootContext());
</script>
