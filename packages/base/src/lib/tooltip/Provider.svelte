<script lang="ts">
  // Source TooltipProvider owns its delay context and composes the canonical FloatingDelayGroup (MIT).
  import { setContext } from 'svelte';
  import FloatingDelayGroup from '../floating-ui/components/FloatingDelayGroup.svelte';
  import { PROVIDER, type TooltipProviderContext } from './provider/TooltipProviderContext.js';
  import type { TooltipProviderProps } from './types.js';
  let { delay, closeDelay, timeout = 400, children }: TooltipProviderProps = $props();
  const delayValue = $derived({ open: delay, close: closeDelay });
  setContext<TooltipProviderContext>(PROVIDER, {
    get delay() {
      return delay;
    },
  });
</script>

<FloatingDelayGroup delay={delayValue} timeoutMs={timeout}
  >{@render children?.()}</FloatingDelayGroup
>
