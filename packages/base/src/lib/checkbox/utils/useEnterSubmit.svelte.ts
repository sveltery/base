// Native event boundary replacing the React synthetic/native preventDefault split
// in Base UI v1.8.0 CheckboxRoot.tsx:322-363. MIT: THIRD_PARTY_NOTICES.md.
import type { BaseUIEvent } from '../../internals/types.js';
import { getDefaultFormSubmitter } from '../../utils/getDefaultFormSubmitter.js';
export function useEnterSubmit(
  controlRef: { current: HTMLElement | null },
  inputRef: { current: HTMLInputElement | null },
) {
  const submissions = new WeakSet<Event>();
  $effect(() => {
    const element = controlRef.current;
    if (!element) return;
    const submitAfterAncestors = (event: KeyboardEvent) => {
      if (!submissions.has(event)) return;
      submissions.delete(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      getDefaultFormSubmitter(inputRef.current?.form ?? null)?.click();
    };
    const view = element.ownerDocument.defaultView!;
    view.addEventListener('keydown', submitAfterAncestors);
    return () => view.removeEventListener('keydown', submitAfterAncestors);
  });
  return (event: BaseUIEvent<KeyboardEvent>) => {
    if (event.key !== 'Enter') return;
    event.preventBaseUIHandler();
    if (!event.defaultPrevented) submissions.add(event);
  };
}
