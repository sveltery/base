// Native event boundary replacing the React synthetic/native preventDefault split
// in Base UI v1.8.0 CheckboxRoot.tsx:322-363. MIT: THIRD_PARTY_NOTICES.md.
import type { BaseUIEvent } from '../../internals/types.js';
import { getDefaultFormSubmitter } from '@sveltery/utils/getDefaultFormSubmitter';
export class EnterSubmitOwner {
  #controlRef: { current: HTMLElement | null };
  #inputRef: { current: HTMLInputElement | null };
  #submissions = new WeakSet<Event>();

  constructor(
    controlRef: { current: HTMLElement | null },
    inputRef: { current: HTMLInputElement | null },
  ) {
    this.#controlRef = controlRef;
    this.#inputRef = inputRef;
    $effect(() => {
      const element = this.#controlRef.current;
      if (!element) return;
      const submitAfterAncestors = (event: KeyboardEvent) => {
        if (!this.#submissions.has(event)) return;
        this.#submissions.delete(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        getDefaultFormSubmitter(this.#inputRef.current?.form ?? null)?.click();
      };
      const view = element.ownerDocument.defaultView!;
      view.addEventListener('keydown', submitAfterAncestors);
      return () => view.removeEventListener('keydown', submitAfterAncestors);
    });
  }

  handleEnterSubmit = (event: BaseUIEvent<KeyboardEvent>) => {
    if (event.key !== 'Enter') return;
    event.preventBaseUIHandler();
    if (!event.defaultPrevented) this.#submissions.add(event);
  };
}
