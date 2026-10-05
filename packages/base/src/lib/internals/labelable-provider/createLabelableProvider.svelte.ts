// Ported from Base UI v1.8.0 LabelableProvider.tsx at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
import { useStableCallback } from '@sveltery/utils/useStableCallback';
import { useRefWithInit } from '@sveltery/utils/useRefWithInit';
import { setLabelableContext, useLabelableContext, type LabelableContext } from './LabelableContext.js';

// The component owns the SSR-stable Svelte id; this body owns the source provider state.
export function createLabelableProvider(defaultId: string): LabelableContext {
  let controlIdState = $state<string | null | undefined>(defaultId);
  let labelId = $state<string>();
  let messageIds = $state<string[]>([]);
  const controlId = $derived(controlIdState === undefined ? defaultId : controlIdState);
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Source control registry is imperative; selected control state owns reactive updates.
  const registrationsRef = useRefWithInit(() => new Map<symbol, string | null>());
  const parent = useLabelableContext();

  const registerControlId = useStableCallback((source: symbol, nextId: string | null | undefined) => {
    const registrations = registrationsRef.current;
    if (nextId === undefined) registrations.delete(source);
    else registrations.set(source, nextId);
    if (registrations.size === 0) return;

    let nextControlId: string | null | undefined;
    for (const id of registrations.values()) {
      if (id === controlIdState) return;
      if (nextControlId === undefined) nextControlId = id;
    }
    controlIdState = nextControlId;
  });
  const resetControlId = useStableCallback(() => {
    if (registrationsRef.current.size === 0) controlIdState = defaultId;
  });
  function getDescriptionProps(externalProps: Record<string, unknown>) {
    const description = externalProps['aria-describedby'] as string | undefined;
    const ids = description ? description.split(' ') : [];
    ids.push(...parent.messageIds, ...messageIds);
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- This temporary Set only deduplicates the current derived message array.
    return { ...externalProps, 'aria-describedby': Array.from(new Set(ids)).join(' ') || undefined };
  }
  const contextValue: LabelableContext = {
    get controlId() { return controlId; }, registerControlId, resetControlId,
    get labelId() { return labelId; },
    setLabelId(value) { labelId = typeof value === 'function' ? value(labelId) : value; },
    get messageIds() { return messageIds; },
    setMessageIds(value) { messageIds = typeof value === 'function' ? value(messageIds) : value; },
    getDescriptionProps,
  };
  setLabelableContext(contextValue);
  return contextValue;
}
