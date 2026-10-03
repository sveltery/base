import { getContext, setContext } from 'svelte';

/** Optional native serialization value. Source selection and business values stay unchanged. */
export interface FieldControlValueContext {
  readonly value: string | undefined;
}

const FIELD_CONTROL_VALUE_CONTEXT = Symbol('base-ui-field-control-native-value');

export function setFieldControlValueContext(context: FieldControlValueContext): void {
  setContext(FIELD_CONTROL_VALUE_CONTEXT, context);
}

/** Read only when building an actual native input's value prop. */
export function useFieldControlNativeValue(): (businessValue: string) => string {
  const context = getContext<FieldControlValueContext | undefined>(FIELD_CONTROL_VALUE_CONTEXT);
  return (businessValue) => context?.value ?? businessValue;
}
