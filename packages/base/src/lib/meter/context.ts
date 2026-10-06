// Adapted from pinned MeterRootContext; MIT: THIRD_PARTY_NOTICES.md.
import { createContext } from 'svelte';
export interface MeterContext {
  readonly formattedValue: string;
  readonly percentageValue: number;
  readonly value: number;
  setLabelId(id: string | undefined | ((current: string | undefined) => string | undefined)): void;
}
const [get, set, has] = createContext<MeterContext>();
export const setMeterContext = set;
export function getMeterContext(): MeterContext {
  const context = has() ? get() : undefined;
  if (!context)
    throw new Error(
      'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.',
    );
  return context;
}
