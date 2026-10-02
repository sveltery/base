// Base UI v1.8.0 LabelableProvider adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
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
const key = Symbol('base-ui-labelable');
export function getLabelableContext(): LabelableContext | undefined { return getContext(key); }
export function createLabelableContext(defaultId: string): LabelableContext {
  const parent = getLabelableContext();
  const registrations = new SvelteMap<symbol, string | null>();
  let controlId = $state<string | null>(defaultId);
  let labelId = $state<string>();
  let messageIds = $state<string[]>([]);
  const context: LabelableContext = {
    get controlId() { return controlId; },
    get labelId() { return labelId; },
    get messageIds() { return messageIds; },
    registerControlId(source, id) {
      if (id === undefined) registrations.delete(source);
      else registrations.set(source, id);
      if (!registrations.size || Array.from(registrations.values()).includes(controlId)) return;
      controlId = registrations.values().next().value!;
    },
    resetControlId() { if (!registrations.size) controlId = defaultId; },
    setLabelId(id) { labelId = id; },
    removeLabelId(id) { if (labelId === id) labelId = undefined; },
    addMessage(id) {
      messageIds = [...messageIds, id];
      return () => { messageIds = messageIds.filter(value => value !== id); };
    },
    getDescriptionProps(props) {
      const external = props['aria-describedby'];
      const ids = typeof external === 'string' && external ? external.split(' ') : [];
      ids.push(...(parent?.messageIds ?? []), ...messageIds);
      return { ...props, 'aria-describedby': Array.from(new SvelteSet(ids)).join(' ') || undefined };
    },
  };
  setContext(key, context);
  return context;
}
