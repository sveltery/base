// Source business body from Base UI v1.8.0 useButton.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { DEV } from 'esm-env';

import { error } from '@sveltery/utils/error';

import { makeEventPreventable, mergeProps } from '../../merge-props/index.js';
import { useCompositeRootContext } from '../composite/root/CompositeRootContext.js';
import type { BaseUIEvent, HTMLProps } from '../types.js';
import { useFocusableWhenDisabled } from '../../utils/useFocusableWhenDisabled.js';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers.js';
export interface UseButtonParameters {
  disabled?: boolean;
  focusableWhenDisabled?: boolean;
  tabIndex?: number;
  native?: boolean;
  composite?: boolean;
}
export function useButton(getParameters: () => UseButtonParameters = () => ({})) {
  const elementRef = $state<{ current: HTMLElement | null }>({ current: null });
  const compositeRootContext = useCompositeRootContext(true);
  function parameters() {
    const {
      disabled = false,
      focusableWhenDisabled,
      tabIndex = 0,
      native: isNativeButton = true,
      composite: compositeProp,
    } = getParameters();
    const isCompositeItem = compositeProp ?? compositeRootContext !== undefined;
    const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
      focusableWhenDisabled,
      disabled,
      composite: isCompositeItem,
      tabIndex,
      isNativeButton,
    });
    return { disabled, isNativeButton, isCompositeItem, focusableWhenDisabledProps };
  }
  if (DEV)
    $effect(() => {
      const isNativeButton = getParameters().native ?? true;
      const element = elementRef.current;
      if (!element) return;
      if (isNativeButton && !isButtonElement(element))
        error(
          'A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.',
        );
      else if (!isNativeButton && isButtonElement(element))
        error(
          'A component that acts as a button expected a non-<button> because the `nativeButton` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as `role` or `aria-disabled`). Use a non-<button> in the `render` prop, or set `nativeButton` to `true`.',
        );
    });
  const updateDisabled = () => {
    const element = elementRef.current;
    if (!isButtonElement(element)) return;
    const { isCompositeItem, disabled, focusableWhenDisabledProps } = parameters();
    if (
      isCompositeItem &&
      disabled &&
      focusableWhenDisabledProps.disabled === undefined &&
      element.disabled
    )
      element.disabled = false;
  };
  $effect(updateDisabled);
  function getButtonProps(externalProps: HTMLProps = {}): HTMLProps {
    const { disabled, isNativeButton, isCompositeItem, focusableWhenDisabledProps } = parameters();
    const {
      onclick: externalOnClick,
      onmousedown: externalOnMouseDown,
      onkeyup: externalOnKeyUp,
      onkeydown: externalOnKeyDown,
      onpointerdown: externalOnPointerDown,
      ...otherExternalProps
    } = externalProps;
    return mergeProps(
      {
        onclick(event: MouseEvent) {
          if (disabled) {
            event.preventDefault();
            return;
          }
          (externalOnClick as ((event: MouseEvent) => void) | undefined)?.(event);
        },
        onmousedown(event: MouseEvent) {
          if (!disabled)
            (externalOnMouseDown as ((event: MouseEvent) => void) | undefined)?.(event);
        },
        onkeydown(event: BaseUIEvent<KeyboardEvent>) {
          if (disabled) return;
          makeEventPreventable(event);
          (externalOnKeyDown as ((event: BaseUIEvent<KeyboardEvent>) => void) | undefined)?.(event);
          if (event.baseUIHandlerPrevented) return;
          const isCurrentTarget = event.target === event.currentTarget;
          const currentTarget = event.currentTarget as HTMLElement;
          const isButton = isButtonElement(currentTarget);
          const isLink = !isNativeButton && isValidLinkElement(currentTarget);
          const shouldClick = isCurrentTarget && (isNativeButton ? isButton : !isLink);
          const isEnterKey = event.key === 'Enter';
          const isSpaceKey = event.key === ' ';
          const role = currentTarget.getAttribute('role');
          const isTextNavigationRole =
            role?.startsWith('menuitem') || role === 'option' || role === 'gridcell';
          if (isCurrentTarget && isCompositeItem && isSpaceKey) {
            if (event.defaultPrevented && isTextNavigationRole) return;
            event.preventDefault();
            if (!isNativeButton || isButton) {
              event.preventBaseUIHandler();
              dispatchClickWithModifiers(currentTarget, event);
            }
            return;
          }
          if (!shouldClick || isNativeButton || (!isSpaceKey && !isEnterKey)) {
            if (isCurrentTarget && isLink && isSpaceKey) event.preventDefault();
            return;
          }
          if (event.defaultPrevented) return;
          event.preventDefault();
          if (isEnterKey) {
            event.preventBaseUIHandler();
            dispatchClickWithModifiers(currentTarget, event);
          }
        },
        onkeyup(event: BaseUIEvent<KeyboardEvent>) {
          if (disabled) return;
          makeEventPreventable(event);
          (externalOnKeyUp as ((event: BaseUIEvent<KeyboardEvent>) => void) | undefined)?.(event);
          if (
            event.target === event.currentTarget &&
            isNativeButton &&
            isCompositeItem &&
            isButtonElement(event.currentTarget as HTMLElement) &&
            event.key === ' '
          ) {
            event.preventDefault();
            return;
          }
          if (event.baseUIHandlerPrevented) return;
          if (
            event.target === event.currentTarget &&
            !isNativeButton &&
            !isCompositeItem &&
            !event.defaultPrevented &&
            event.key === ' '
          ) {
            event.preventBaseUIHandler();
            dispatchClickWithModifiers(event.currentTarget as HTMLElement, event);
          }
        },
        onpointerdown(event: PointerEvent) {
          if (disabled) {
            event.preventDefault();
            return;
          }
          (externalOnPointerDown as ((event: PointerEvent) => void) | undefined)?.(event);
        },
      },
      isNativeButton ? { type: 'button' } : { role: 'button' },
      focusableWhenDisabledProps,
      otherExternalProps,
    );
  }
  const buttonRef = (element: HTMLElement | null) => {
    elementRef.current = element;
    updateDisabled();
  };
  return {
    getButtonProps,
    buttonRef,
    get element() {
      return elementRef.current;
    },
  };
}
function isButtonElement(element: Element | null): element is HTMLButtonElement {
  return element?.tagName === 'BUTTON';
}
function isValidLinkElement(element: Element | null): element is HTMLAnchorElement {
  return element?.tagName === 'A' && Boolean((element as HTMLAnchorElement).href);
}
