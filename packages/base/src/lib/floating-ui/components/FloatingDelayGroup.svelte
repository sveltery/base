<script lang="ts">
  // Original Base UI 1.8.0 FloatingDelayGroup provider business, native context.
  // MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import { setContext, untrack, type Snippet } from 'svelte';
  import { useTimeout } from '@sveltery/utils/useTimeout';
  
  import { getDelay } from '../hooks/useHoverShared.js';
  import type { Delay } from '../types.js';
  import {
    FloatingDelayGroupContext,
    type FloatingDelayGroupContextValue,
  } from './FloatingDelayGroupContext.js';

  interface Props {
    children?: Snippet | undefined;
    delay: Delay;
    timeoutMs?: number | undefined;
  }

  let { children, delay, timeoutMs = 0 }: Props = $props();

  const delayRef = { current: untrack(() => delay) };
  const initialDelayRef = { current: untrack(() => delay) };
  const currentIdRef = { current: null as string | null | undefined };
  const currentContextRef: FloatingDelayGroupContextValue['currentContextRef'] = { current: null };
  const timeout = useTimeout();

  $effect(() => {
    initialDelayRef.current = delay;

    if (!currentIdRef.current) {
      delayRef.current = delay;
      return;
    }

    delayRef.current = {
      open: getDelay(delayRef.current, 'open'),
      close: getDelay(delay, 'close'),
    };
  });

  setContext<FloatingDelayGroupContextValue>(FloatingDelayGroupContext, {
    hasProvider: true,
    delayRef,
    initialDelayRef,
    currentIdRef,
    get timeoutMs() { return timeoutMs; },
    currentContextRef,
    timeout,
  });
</script>

{@render children?.()}
