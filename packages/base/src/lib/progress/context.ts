// Adapted from pinned ProgressRootContext; MIT: THIRD_PARTY_NOTICES.md.
import { createContext } from 'svelte';
import type { ProgressRootState } from './types.js';
export interface ProgressContext {
  readonly formattedValue: string;
  readonly percentageValue: number | null;
  readonly value: number | null;
  readonly state: ProgressRootState;
  setLabelId(id: string | undefined | ((current: string | undefined) => string | undefined)): void;
}
const [get, set, has] = createContext<ProgressContext>();
export const setProgressContext = set;
export function getProgressContext(): ProgressContext {
  const context = has() ? get() : undefined;
  if (!context)
    throw new Error(
      'Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.',
    );
  return context;
}
