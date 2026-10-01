import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
/** State passed to Button class/style functions and render snippets. */
export interface ButtonState { disabled: boolean }
/** Native DOM event/children/render/ref adaptations are shared with existing composition. */
export type ButtonProps = Omit<ElementProps<ButtonState, HTMLButtonAttributes>, 'disabled'> & {
  disabled?: boolean;
  nativeButton?: boolean;
  focusableWhenDisabled?: boolean;
};
