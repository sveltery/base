// Ported from Base UI v1.8.0 field/item/FieldItemContext.ts; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
export interface FieldItemContext { readonly disabled: boolean }
const key = Symbol('base-ui-field-item');
const DEFAULT_FIELD_ITEM_CONTEXT: FieldItemContext = { disabled: false };
export function setFieldItemContext(value: FieldItemContext) { setContext(key, value); }
export function useFieldItemContext(): FieldItemContext {
  return getContext<FieldItemContext | undefined>(key) ?? DEFAULT_FIELD_ITEM_CONTEXT;
}
