// Ported from Base UI v1.8.0 internals/labelable-provider/LabelableContext.ts.
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { NOOP } from '../../utils/empty.js';
export interface LabelableContext {
  readonly controlId: string | null | undefined;
  registerControlId(source: symbol, id: string | null | undefined): void;
  resetControlId(): void;
  readonly labelId: string | undefined;
  setLabelId(id: string | undefined | ((previous: string | undefined) => string | undefined)): void;
  readonly messageIds: string[];
  setMessageIds(ids: string[] | ((previous: string[]) => string[])): void;
  getDescriptionProps(externalProps: Record<string, unknown>): Record<string, unknown>;
}
export const DEFAULT_LABELABLE_CONTEXT: LabelableContext = {
  controlId: undefined, registerControlId: NOOP, resetControlId: NOOP,
  labelId: undefined, setLabelId: NOOP, messageIds: [], setMessageIds: NOOP,
  getDescriptionProps: externalProps => externalProps,
};
const labelableKey = Symbol('base-ui-labelable');
export function setLabelableContext(value: LabelableContext) { setContext(labelableKey, value); }
export function useLabelableContext(): LabelableContext {
  return getContext<LabelableContext | undefined>(labelableKey) ?? DEFAULT_LABELABLE_CONTEXT;
}
