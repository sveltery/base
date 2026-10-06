// Derived from mui/base-ui at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT, see ../../../THIRD_PARTY_NOTICES.md.
/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve pinned data defaults and rejection callback typing. */
import type { Snippet } from 'svelte';
import type { BaseUIComponentProps, ComponentRenderFn, HTMLProps } from '../internals/types.js';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ToastManager } from './createToastManager.js';
import type { PreventableEvent } from '../merge-props/index.js';

/** Svelte content contract; rendering and label registration belong to the parts slice. */
export type ToastContent = string | number | boolean | null | Snippet;
type ActionHandlers = {
  [Key in keyof HTMLButtonAttributes]: Key extends `on${string}`
    ? NonNullable<HTMLButtonAttributes[Key]> extends (event: infer EventType) => infer Result
      ? EventType extends Event
        ? ((event: EventType & PreventableEvent) => Result) | null | undefined
        : HTMLButtonAttributes[Key]
      : HTMLButtonAttributes[Key]
    : HTMLButtonAttributes[Key];
};
export type ToastActionProps = Omit<ActionHandlers, 'children'> & {
  children?: ToastContent;
};

export interface ToastObject<Data extends object = any> {
  id: string;
  title?: ToastContent;
  description?: ToastContent;
  type?: string;
  timeout?: number;
  priority?: 'low' | 'high';
  transitionStatus?: 'starting' | 'ending';
  updateKey?: number;
  limited?: boolean;
  height?: number;
  /** Internal node registration uses the actual Svelte DOM node, not a React ref object. */
  ref?: HTMLElement | null;
  onClose?: () => void;
  onRemove?: () => void;
  actionProps?: ToastActionProps;
  data?: Data;
}
export type ToastManagerAddOptions<Data extends object> = Omit<
  ToastObject<Data>,
  'id' | 'height' | 'ref' | 'limited' | 'updateKey'
> & { id?: string };
export type ToastManagerUpdateOptions<Data extends object> = Partial<
  Omit<ToastObject<Data>, 'id' | 'ref' | 'height' | 'transitionStatus' | 'limited' | 'updateKey'>
>;
export interface ToastManagerPromiseOptions<Value, Data extends object> {
  loading: string | ToastManagerUpdateOptions<Data>;
  success:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((result: Value) => string | ToastManagerUpdateOptions<Data>);
  error:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((error: any) => string | ToastManagerUpdateOptions<Data>);
}

/** Contract for the future context accessor; reading `toasts` subscribes in a Svelte reaction. */
export interface ToastManagerFacade<Data extends object = any> {
  readonly toasts: ToastObject<Data>[];
  add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
  close: (id?: string) => void;
  update: <T extends Data = Data>(
    id: string,
    updates:
      ToastManagerUpdateOptions<T> | ((previous: ToastObject<T>) => ToastManagerUpdateOptions<T>),
  ) => void;
  promise: <Value, T extends Data = Data>(
    promise: Promise<Value>,
    options: ToastManagerPromiseOptions<Value, T>,
  ) => Promise<Value>;
}

export interface ToastProviderProps {
  children?: Snippet;
  timeout?: number;
  limit?: number;
  toastManager?: ToastManager;
}
export interface ToastRootState {
  transitionStatus: 'starting' | 'ending' | undefined;
  expanded: boolean;
  limited: boolean;
  type: string | undefined;
  swiping: false;
  swipeDirection: undefined;
}
export interface ToastViewportState {
  expanded: boolean;
}
export interface ToastContentState {
  expanded: boolean;
  behind: boolean;
}
export interface ToastLabelState {
  type: string | undefined;
}
type PreventableHandlers<Props> = {
  [Key in keyof Props]: Key extends `on:${string}`
    ? Props[Key]
    : Key extends `on${string}`
      ? NonNullable<Props[Key]> extends (event: infer E) => infer Result
        ? E extends Event
          ? ((event: E & PreventableEvent) => Result) | Extract<Props[Key], null | undefined>
          : Props[Key]
        : Props[Key]
      : Props[Key];
};
/** Native element props and component-owned Svelte replacement snippets. */
export type ToastElementProps<
  State,
  NativeProps = HTMLAttributes<HTMLElement>,
  Content = Snippet,
> = Omit<PreventableHandlers<NativeProps>, 'class' | 'style' | 'children'> & {
  children?: Content;
  render?: ComponentRenderFn<HTMLProps, State> | undefined;
  class?: string | ((state: State) => string | undefined);
  style?: BaseUIComponentProps<State>['style'];
  ref?: HTMLElement | null;
};
export type ToastRootProps = ToastElementProps<ToastRootState> & {
  toast: ToastObject;
  /** This bounded slice requires the upstream gesture opt-out explicitly. */
  swipeDirection: [];
};
export type ToastViewportProps = ToastElementProps<ToastViewportState>;
export type ToastContentProps = ToastElementProps<ToastContentState>;
export type ToastTitleProps = ToastElementProps<
  ToastLabelState,
  HTMLAttributes<HTMLHeadingElement>,
  ToastContent
>;
export type ToastDescriptionProps = ToastElementProps<
  ToastLabelState,
  HTMLAttributes<HTMLParagraphElement>,
  ToastContent
>;
export type ToastActionComponentProps = Omit<
  ToastElementProps<ToastLabelState, HTMLButtonAttributes, ToastContent>,
  'disabled'
> & {
  disabled?: boolean | undefined;
  /** Set false when render supplies a non-button host. */
  nativeButton?: boolean | undefined;
};
export type ToastCloseProps = ToastActionComponentProps;

/** Standalone lightweight portal; empty upstream state, native props and replacement composition. */
export type ToastPortalState = Record<string, never>;
export type ToastPortalProps = ToastElementProps<ToastPortalState> & {
  container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null;
};
