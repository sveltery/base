// Ported from Base UI v1.8.0 FieldsetRootContext.ts; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
export interface FieldsetRootContext {
  readonly legendId: string | undefined;
  setLegendId(value: string | undefined | ((previous: string | undefined) => string | undefined)): void;
  readonly disabled: boolean;
}
const key = Symbol('base-ui-fieldset');
export function setFieldsetRootContext(value: FieldsetRootContext) { setContext(key, value); }
export function useFieldsetRootContext(optional: true): FieldsetRootContext | undefined;
export function useFieldsetRootContext(optional?: false): FieldsetRootContext;
export function useFieldsetRootContext(optional = false) {
  const context = getContext<FieldsetRootContext | undefined>(key);
  if (!context && !optional) throw new Error('Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.');
  return context;
}
