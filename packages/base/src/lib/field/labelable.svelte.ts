// Base UI v1.8.0 LabelableProvider adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { useLabelableContext, type LabelableContext as SourceLabelableContext } from '../internals/labelable-provider/LabelableContext.js';
import { createLabelableProvider } from '../internals/labelable-provider/LabelableProvider.svelte.js';
export interface LabelableContext {
  readonly controlId: string | null;
  readonly labelId: string | undefined;
  readonly messageIds: string[];
  registerControlId(source: symbol, id: string | null | undefined): void;
  resetControlId(): void;
  setLabelId(id: string): void;
  removeLabelId(id: string): void;
  addMessage(id: string): () => void;
  getDescriptionProps(props: Record<string, unknown>): Record<string, unknown>;
}
function facade(source: SourceLabelableContext): LabelableContext {
  return {
    get controlId() { return source.controlId ?? null; },
    get labelId() { return source.labelId; },
    get messageIds() { return source.messageIds; },
    registerControlId: source.registerControlId, resetControlId: source.resetControlId,
    setLabelId: source.setLabelId,
    removeLabelId(id) { source.setLabelId(previous => previous === id ? undefined : previous); },
    addMessage(id) {
      source.setMessageIds(previous => [...previous, id]);
      return () => source.setMessageIds(previous => previous.filter(value => value !== id));
    },
    getDescriptionProps: source.getDescriptionProps,
  };
}
export function getLabelableContext(): LabelableContext { return facade(useLabelableContext()); }
export function createLabelableContext(defaultId: string): LabelableContext { return facade(createLabelableProvider(defaultId)); }
