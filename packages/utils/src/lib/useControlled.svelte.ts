// Adapted from Base UI v1.8.0 packages/utils/src/useControlled.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { DEV } from 'esm-env';
import { untrack } from 'svelte';
import { error } from './error.js';

export type SetStateAction<T> = T | ((previousValue: T) => T);
export type Dispatch<T> = (value: T) => void;

export interface UseControlledProps<T = unknown> {
  /**
   * Holds the component value when it's controlled.
   */
  controlled: T | undefined;
  /**
   * The default value when uncontrolled, and the fallback if a controlled value later becomes `undefined`.
   */
  default: T | undefined;
  /**
   * The component name displayed in warnings.
   */
  name: string;
  /**
   * The name of the state variable displayed in warnings.
   */
  state?: string | undefined;
}

// A defined default guarantees a defined value. Otherwise, preserve `undefined`,
// including when callers pass an explicit generic argument.
export function useControlled<T = unknown>(
  getProps: () => Omit<UseControlledProps<T>, 'default'> & { default: T },
): [() => T, Dispatch<SetStateAction<T>>];
export function useControlled<T = unknown>(
  getProps: () => UseControlledProps<T>,
): [() => T | undefined, Dispatch<SetStateAction<T | undefined>>];
export function useControlled<T = unknown>(
  getProps: () => UseControlledProps<T>,
): [() => T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const { controlled, default: defaultProp } = untrack(getProps);
  // isControlled is ignored in the hook dependency lists as it should never change.
  const isControlled = controlled !== undefined;
  let valueState = $state.raw<T | undefined>(defaultProp);
  // Keep the initial mode, but use the initial default if a controlled value disappears.
  // This preserves the defined-default overload while the mode-switch warning is emitted below.
  const value = () => {
    const controlledValue = getProps().controlled;
    return isControlled && controlledValue !== undefined ? controlledValue : valueState;
  };

  if (DEV) {
    $effect(() => {
      const { controlled, name, state = 'value' } = getProps();
      if (isControlled !== (controlled !== undefined)) {
        error(
          [
            `A component is changing the ${
              isControlled ? '' : 'un'
            }controlled ${state} state of ${name} to be ${isControlled ? 'un' : ''}controlled.`,
            'Elements should not switch from uncontrolled to controlled (or vice versa).',
            `Decide between using a controlled or uncontrolled ${name} ` +
              'element for the lifetime of the component.',
            "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.",
            'More info: https://fb.me/react-controlled-components',
          ].join('\n'),
        );
      }
    });

    const defaultValue = defaultProp;
    let previousDefaultProp: T | undefined;
    let defaultEffectInitialized = false;

    $effect(() => {
      const defaultProp = getProps().default;
      // The source default diagnostic subscribes only to defaultProp. Broad
      // native props getters may read other props while constructing the object.
      if (defaultEffectInitialized && Object.is(previousDefaultProp, defaultProp)) return;
      defaultEffectInitialized = true;
      previousDefaultProp = defaultProp;
      untrack(() => {
        const { name, state = 'value' } = getProps();
        if (
          !isControlled &&
          serializeToDevModeString(defaultValue) !== serializeToDevModeString(defaultProp)
        ) {
          error(
            [
              `A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` +
                `To suppress this warning opt to use a controlled ${name}.`,
            ].join('\n'),
          );
        }
      });
    });
  }

  const setValueIfUncontrolled = (newValue: SetStateAction<T | undefined>) => {
    if (!isControlled) {
      valueState = typeof newValue === 'function'
        ? untrack(() => (newValue as (previousValue: T | undefined) => T | undefined)(valueState))
        : newValue;
    }
  };

  return [value, setValueIfUncontrolled];
}

function serializeToDevModeString(input: unknown) {
  let nextId = 0;
  const seen = new WeakMap<object, number>();

  try {
    const result = JSON.stringify(input, function replacer(key, value) {
      if (key === '_owner' && this != null && typeof this === 'object' && '$$typeof' in this) {
        return undefined;
      }

      if (typeof value === 'bigint') {
        return `__bigint__:${value}`;
      }

      if (value !== null && typeof value === 'object') {
        const id = seen.get(value);
        if (id !== undefined) {
          return `__object__:${id}`;
        }

        seen.set(value, nextId);
        nextId += 1;
      }

      return value;
    });

    return result ?? `__top__:${typeof input}`;
  } catch {
    return '__unserializable__';
  }
}
