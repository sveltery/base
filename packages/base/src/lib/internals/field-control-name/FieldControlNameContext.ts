import { getContext, setContext } from 'svelte';

/** Optional native serialization override. Field business names remain in the source context. */
export interface FieldControlNameContext {
  readonly name: string | undefined;
}

const FIELD_CONTROL_NAME_CONTEXT = Symbol('base-ui-field-control-native-name');

export function setFieldControlNameContext(context: FieldControlNameContext): void {
  setContext(FIELD_CONTROL_NAME_CONTEXT, context);
}

/** Read only when building an actual native input's name prop. */
export function useFieldControlNativeName(): (businessName: string | null | undefined) => string | null | undefined {
  const context = getContext<FieldControlNameContext | undefined>(FIELD_CONTROL_NAME_CONTEXT);
  return (businessName) => context?.name ?? businessName;
}
