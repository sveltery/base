// Base UI v1.8.0 Toolbar public contracts; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent, ComponentRenderFn, HTMLProps } from '../internals/types.js';
import type { SeparatorProps, SeparatorState } from '../separator/types.js';
export type ToolbarRootOrientation = 'horizontal' | 'vertical';
export type Orientation = ToolbarRootOrientation;
export interface ToolbarRootItemMetadata { disabled: boolean; focusableWhenDisabled: boolean }
export interface ToolbarRootState { disabled: boolean; orientation: ToolbarRootOrientation }
export type ToolbarGroupState = ToolbarRootState;
export interface ToolbarButtonState extends ToolbarRootState { focusable: boolean }
export interface ToolbarInputState extends ToolbarRootState { focusable: boolean }
export interface ToolbarLinkState { orientation: ToolbarRootOrientation }
export type ToolbarSeparatorState = SeparatorState;
type PartProps<State, Native> =
  Omit<WithBaseUIEvent<Native>, 'class' | 'style' | 'children' | 'color' | 'defaultValue' | 'defaultChecked'> &
  BaseUIComponentProps<State> & { children?: Snippet | undefined; ref?: HTMLElement | null | undefined };
export type ToolbarRootProps = PartProps<ToolbarRootState, HTMLAttributes<HTMLDivElement>> & {
  disabled?: boolean | undefined;
  orientation?: ToolbarRootOrientation | undefined;
  loopFocus?: boolean | undefined;
};
export type ToolbarGroupProps = PartProps<ToolbarGroupState, HTMLAttributes<HTMLDivElement>> & { disabled?: boolean | undefined };
export type ToolbarButtonProps = Omit<PartProps<ToolbarButtonState, HTMLButtonAttributes>, 'disabled'> & {
  nativeButton?: boolean | undefined;
  disabled?: boolean | undefined;
  focusableWhenDisabled?: boolean | undefined;
};
export type ToolbarInputProps = Omit<PartProps<ToolbarInputState, HTMLInputAttributes>, 'disabled'> & {
  disabled?: boolean | undefined;
  focusableWhenDisabled?: boolean | undefined;
  defaultValue?: HTMLInputAttributes['defaultValue'] | undefined;
};
/** The source Link uniquely gives its render callback the native anchor props. */
export type ToolbarLinkProps = Omit<PartProps<ToolbarLinkState, HTMLAnchorAttributes>, 'render'> & {
  render?: ComponentRenderFn<HTMLAnchorAttributes & HTMLProps, ToolbarLinkState> | undefined;
};
export type ToolbarSeparatorProps = SeparatorProps;
