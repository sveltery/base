// Base UI v1.8.0 Form context adaptation; MIT: THIRD_PARTY_NOTICES.md.
import { useFormContext } from '../internals/form-context/FormContext.js';
import type { FormContext } from '../internals/form-context/FormContext.js';
import type { FormValues } from './types.js';
export { setFormContext } from '../internals/form-context/FormContext.js';
export type { FormContext, RegisteredField } from '../internals/form-context/FormContext.js';
export const getFormContext = useFormContext;
export function getFormValues(context: FormContext): FormValues {
  const values: FormValues = {};
  context.formRef.current.fields.forEach(field => { if (field.name) values[field.name] = field.getValue(); });
  return values;
}
