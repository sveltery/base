// Source business props from Base UI v1.8.0 useFocusableWhenDisabled.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import type { HTMLProps } from '../internals/types.js';
export interface UseFocusableWhenDisabledParameters {
  focusableWhenDisabled?: boolean;
  disabled: boolean;
  composite?: boolean;
  tabIndex?: number;
  isNativeButton: boolean;
}
export function useFocusableWhenDisabled(
  parameters: UseFocusableWhenDisabledParameters,
): { props: HTMLProps } {
  const {
    focusableWhenDisabled,
    disabled,
    composite = false,
    tabIndex: tabIndexProp = 0,
    isNativeButton,
  } = parameters;
  const isFocusableComposite = composite && focusableWhenDisabled !== false;
  const isNonFocusableComposite = composite && focusableWhenDisabled === false;
  const props: HTMLProps = {
    onkeydown(event: KeyboardEvent) {
      if (disabled && focusableWhenDisabled && event.key !== 'Tab')
        event.preventDefault();
    },
  };
  if (!composite) {
    props.tabindex = tabIndexProp;
    if (!isNativeButton && disabled)
      props.tabindex = focusableWhenDisabled ? tabIndexProp : -1;
  }
  if (
    (isNativeButton && (focusableWhenDisabled || isFocusableComposite)) ||
    (!isNativeButton && disabled)
  )
    props['aria-disabled'] = disabled;
  if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite))
    props.disabled = disabled;
  return { props };
}
