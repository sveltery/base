// Private Accordion context adaptation. Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
import { getContext, setContext } from 'svelte';
import type { AccordionRootState, AccordionRootChangeEventDetails, AccordionItemState } from './types.js';
export interface AccordionRootContext {
  readonly value: unknown[];
  readonly disabled: boolean;
  readonly hiddenUntilFound: boolean;
  readonly keepMounted: boolean;
  readonly state: AccordionRootState<unknown>;
  handleValueChange(value: unknown, nextOpen: boolean, details: AccordionRootChangeEventDetails): void;
  registerItem(node: HTMLElement, publishIndex: (index: number) => void): () => void;
}
export interface AccordionItemContext {
  readonly state: AccordionItemState;
  readonly open: boolean;
  readonly defaultTriggerId: string;
  readonly triggerId: string | undefined;
  setTriggerId(next: string | null | undefined | ((current: string | null | undefined) => string | null | undefined)): void;
}
const rootKey = Symbol('Accordion.Root');
const itemKey = Symbol('Accordion.Item');
export function setAccordionRootContext(value: AccordionRootContext) { setContext(rootKey, value); }
export function getAccordionRootContext(): AccordionRootContext {
  const value = getContext<AccordionRootContext | undefined>(rootKey);
  if (!value) throw new Error('Base UI: AccordionRootContext is missing. Accordion parts must be placed within <Accordion.Root>.');
  return value;
}
export function setAccordionItemContext(value: AccordionItemContext) { setContext(itemKey, value); }
export function getAccordionItemContext(): AccordionItemContext {
  const value = getContext<AccordionItemContext | undefined>(itemKey);
  if (!value) throw new Error('Base UI: AccordionItemContext is missing. Accordion parts must be placed within <Accordion.Item>.');
  return value;
}
