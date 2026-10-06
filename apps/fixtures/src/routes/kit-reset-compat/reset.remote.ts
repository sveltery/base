// Literal SDK fixture; no Base reset adapter or private SDK state.
import { form, query } from '$app/server';
export type Input = { id: string; label: string; enabled?: boolean };
let effects = 0;
export const readResetEffects = query(async () => effects);
const schema = {
  '~standard': {
    version: 1 as const,
    vendor: 'sdk-reset-compat',
    types: undefined as unknown as { input: Input; output: Input },
    validate(input: unknown): { value: Input } | { issues: { message: string; path: string[] }[] } {
      if (!input || typeof input !== 'object')
        return { issues: [{ message: 'Object required', path: [] }] };
      const value = input as Partial<Input>;
      if (
        typeof value.id !== 'string' ||
        typeof value.label !== 'string' ||
        (value.enabled !== undefined && typeof value.enabled !== 'boolean')
      ) {
        return { issues: [{ message: 'Complete submission required', path: [] }] };
      }
      return { value: value as Input };
    },
  },
};
export const saveReset = form(schema, async ({ id, label, enabled }) => ({
  id,
  label,
  enabled: enabled ?? false,
  effects: ++effects,
}));
