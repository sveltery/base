// Original Base UI 1.8.0 FloatingDelayGroup context, native Svelte lookup.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { getContext } from 'svelte';
import { Timeout } from '@sveltery/utils/useTimeout';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import type { Delay } from '../types.js';

export interface FloatingDelayGroupContextValue {
  readonly hasProvider: boolean;
  readonly timeoutMs: number;
  delayRef: { current: Delay };
  initialDelayRef: { current: Delay };
  timeout: Timeout;
  currentIdRef: { current: string | null | undefined };
  currentContextRef: {
    current: {
      onOpenChange: (open: boolean, eventDetails: BaseUIChangeEventDetails<string>) => void;
      setIsInstantPhase: (value: boolean) => void;
    } | null;
  };
}

export const FloatingDelayGroupContext = Symbol('Base UI FloatingDelayGroupContext');

const defaultContext: FloatingDelayGroupContextValue = {
  hasProvider: false,
  timeoutMs: 0,
  delayRef: { current: 0 },
  initialDelayRef: { current: 0 },
  timeout: new Timeout(),
  currentIdRef: { current: null },
  currentContextRef: { current: null },
};

export function useFloatingDelayGroupContext(): FloatingDelayGroupContextValue {
  return (
    getContext<FloatingDelayGroupContextValue | undefined>(FloatingDelayGroupContext) ??
    defaultContext
  );
}
