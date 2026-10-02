// Base UI v1.8.0 Fieldset context adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
export interface FieldsetContext {
  readonly disabled: boolean;
  readonly legendId: string | undefined;
  setLegendId(id: string | undefined): void;
  removeLegendId(id: string): void;
}
const key = Symbol('base-ui-fieldset');
export function setFieldsetContext(value: FieldsetContext) { setContext(key, value); }
export function getFieldsetContext(optional = false): FieldsetContext | undefined {
  const value = getContext<FieldsetContext | undefined>(key);
  if (!value && !optional) throw new Error('Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.');
  return value;
}
