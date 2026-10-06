// Native public representation of Base UI v1.8.0 Button.tsx at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';

/** State passed to Button class/style functions and render snippets. */
export interface ButtonState {
  /** Whether the button should ignore user interaction. */
  disabled: boolean;
}

/** Native button attributes with shared snippet, class/style and event types. */
export type ButtonProps = Omit<
  WithBaseUIEvent<HTMLButtonAttributes>,
  'class' | 'style' | 'children' | 'disabled'
> &
  BaseUIComponentProps<ButtonState> & {
    children?: Snippet | undefined;
    /** Svelte adaptation of the forwarded ref: bind to the actual native host. */
    ref?: HTMLElement | null | undefined;
    disabled?: boolean | undefined;
    /** Whether the render snippet supplies a native button. @default true */
    nativeButton?: boolean | undefined;
    /** Whether the button should remain focusable when disabled. @default false */
    focusableWhenDisabled?: boolean | undefined;
  };
