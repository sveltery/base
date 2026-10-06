// SDK-boundary fixture: requests and server effects are measured separately.
import { form, query } from '$app/server';
export type Input = { id: string; email: string; intent: string };
let effects = 0;
export const readEffects = query(async () => effects);
const schema = {
  '~standard': {
    version: 1 as const,
    vendor: 'sdk-submit-compat',
    types: undefined as unknown as { input: Input; output: Input },
    validate(input: unknown): { value: Input } | { issues: { message: string; path: string[] }[] } {
      if (!input || typeof input !== 'object')
        return { issues: [{ message: 'Object required', path: [] }] };
      const value = input as Partial<Input>;
      if (
        typeof value.id !== 'string' ||
        typeof value.email !== 'string' ||
        !value.email.includes('@') ||
        typeof value.intent !== 'string'
      ) {
        return { issues: [{ message: 'Complete submission required', path: [] }] };
      }
      // The server deliberately accepts blocked@example.com: only Field rejects it.
      return { value: { id: value.id, email: value.email, intent: value.intent } };
    },
  },
};
export const saveCompat = form(schema, async ({ id, email, intent }) => ({
  id,
  email,
  intent,
  effects: ++effects,
}));
