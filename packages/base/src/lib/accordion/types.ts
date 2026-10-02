// Adapted from mui/base-ui v1.8.0 Accordion declarations, immutable
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve upstream generic defaults and Item's unconstrained value. */
import type { ClassValue, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { CollapsibleTransitionStatus } from '../collapsible/types.js';
export type AccordionValue<Value = any> = Value[];
export interface AccordionRootState<Value = any> {
  value: AccordionValue<Value>;
  disabled: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  orientation: 'horizontal' | 'vertical';
}
export interface AccordionItemState extends AccordionRootState { hidden: boolean; index: number; open: boolean }
export type AccordionHeaderState = AccordionItemState;
export type AccordionTriggerState = AccordionItemState;
export interface AccordionPanelState extends AccordionItemState { transitionStatus: CollapsibleTransitionStatus }
export type AccordionRootChangeEventReason = 'trigger-press' | 'none';
export type AccordionRootChangeEventDetails = BaseUIChangeEventDetails<AccordionRootChangeEventReason>;
export type AccordionItemChangeEventReason = 'trigger-press' | 'none';
export type AccordionItemChangeEventDetails = BaseUIChangeEventDetails<AccordionItemChangeEventReason>;
type PartProps<State, NativeProps> = Omit<ElementProps<State, NativeProps>, 'class'> & { class?: ClassValue | ((state: State) => ClassValue) };
export type AccordionRootProps<Value = any> = PartProps<AccordionRootState<Value>, HTMLAttributes<HTMLDivElement>> & {
  value?: AccordionValue<Value>;
  defaultValue?: AccordionValue<Value>;
  disabled?: boolean;
  hiddenUntilFound?: boolean;
  keepMounted?: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  loopFocus?: boolean;
  onValueChange?: (value: AccordionValue<Value>, details: AccordionRootChangeEventDetails) => void;
  multiple?: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  orientation?: 'horizontal' | 'vertical';
};
export type AccordionItemProps = PartProps<AccordionItemState, HTMLAttributes<HTMLDivElement>> & {
  value?: any;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: AccordionItemChangeEventDetails) => void;
};
export type AccordionHeaderProps = PartProps<AccordionHeaderState, HTMLAttributes<HTMLHeadingElement>>;
export type AccordionTriggerProps = PartProps<AccordionTriggerState, HTMLButtonAttributes> & { nativeButton?: boolean };
export type AccordionPanelProps = PartProps<AccordionPanelState, HTMLAttributes<HTMLDivElement>> & { keepMounted?: boolean; hiddenUntilFound?: boolean };
