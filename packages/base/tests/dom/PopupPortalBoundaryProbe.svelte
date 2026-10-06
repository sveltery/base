<script lang="ts">
  import { onMount } from 'svelte';
  import {
    usePortalContext,
    type FloatingPortalContext,
  } from '../../src/lib/floating-ui/components/FloatingPortalContext.js';
  let {
    name,
    report,
    focus = false,
  }: {
    name: string;
    report: (name: string, context: FloatingPortalContext | null) => void;
    focus?: boolean;
  } = $props();
  const context = usePortalContext();
  onMount(() => {
    report(name, context);
    // Direct context-consumer witness for the unchanged Full guard/aria body.
    // This does not claim the separate FloatingFocusManager declaration.
    if (focus)
      context?.setFocusManagerState({
        modal: false,
        open: true,
        closeOnFocusOut: false,
        domReference: null,
        onOpenChange() {},
      });
    return () => {
      if (focus) context?.setFocusManagerState(null);
    };
  });
</script>
