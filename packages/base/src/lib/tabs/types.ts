// Base UI v1.8.0 Tabs public contracts at 47b40521; native Svelte types. MIT.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
  BaseUIComponentProps,
  WithBaseUIEvent,
} from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The pinned Source Value accepts any value, including null.
export type TabsTabValue = any | null;
export type TabsTabActivationDirection =
  'left' | 'right' | 'up' | 'down' | 'none';
export type TabsRootOrientation = 'horizontal' | 'vertical';
export interface TabsTabPosition {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface TabsTabSize {
  width: number;
  height: number;
}
export interface TabsTabMetadata {
  disabled: boolean;
  id: string | undefined;
  value: TabsTabValue | undefined;
}
export interface TabsPanelMetadata {
  id?: string | undefined;
  value: TabsTabValue;
}
export interface TabsRootState {
  orientation: TabsRootOrientation;
  tabActivationDirection: TabsTabActivationDirection;
}
export type TabsListState = TabsRootState;
export interface TabsTabState extends TabsRootState {
  disabled: boolean;
  active: boolean;
}
export interface TabsPanelState extends TabsRootState {
  hidden: boolean;
  transitionStatus: TransitionStatus;
}
export interface TabsIndicatorState extends TabsRootState {
  activeTabPosition: TabsTabPosition | null;
  activeTabSize: TabsTabSize | null;
}
type ElementProps<State, Attributes> = Omit<
  WithBaseUIEvent<Attributes>,
  'class' | 'style' | 'children'
> &
  BaseUIComponentProps<State> & {
    children?: Snippet | undefined;
    /** Native Svelte element binding, also available through render snippet attachment props. */
    ref?: HTMLElement | null | undefined;
  };
export type TabsRootChangeEventReason =
  'none' | 'disabled' | 'missing' | 'initial';
export type TabsRootChangeEventDetails = BaseUIChangeEventDetails<
  TabsRootChangeEventReason,
  { activationDirection: TabsTabActivationDirection }
>;
export type TabsRootProps = ElementProps<
  TabsRootState,
  HTMLAttributes<HTMLDivElement>
> & {
  value?: TabsTabValue | undefined;
  defaultValue?: TabsTabValue | undefined;
  orientation?: TabsRootOrientation | undefined;
  /** Automatic initial/disabled/missing fallbacks cannot be canceled. */
  onValueChange?:
    | ((value: TabsTabValue, details: TabsRootChangeEventDetails) => void)
    | undefined;
};
export type TabsListProps = ElementProps<
  TabsListState,
  HTMLAttributes<HTMLDivElement>
> & {
  activateOnFocus?: boolean | undefined;
  loopFocus?: boolean | undefined;
};
export type TabsTabProps = Omit<
  ElementProps<TabsTabState, HTMLButtonAttributes>,
  'value' | 'disabled'
> & {
  value: TabsTabValue;
  disabled?: boolean | undefined;
  nativeButton?: boolean | undefined;
};
export type TabsPanelProps = ElementProps<
  TabsPanelState,
  HTMLAttributes<HTMLDivElement>
> & {
  value: TabsTabValue;
  keepMounted?: boolean | undefined;
};
export type TabsIndicatorProps = ElementProps<
  TabsIndicatorState,
  HTMLAttributes<HTMLSpanElement>
> & {
  renderBeforeHydration?: boolean | undefined;
};
