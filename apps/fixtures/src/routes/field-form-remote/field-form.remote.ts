// Actual Kit server validation and visible effect counter; fixture-only.
import { form } from '$app/server';
type Data = { email: string };
let effectCount = 0;
const schema = {
  '~standard': {
    version: 1 as const, vendor: 'field-form-fixture',
    types: undefined as unknown as { input: Data; output: Data },
    validate(value: unknown): { value: Data } | { issues: { message: string; path: string[] }[] } {
      const email = value && typeof value === 'object' && 'email' in value ? value.email : undefined;
      if (typeof email !== 'string' || !email.includes('@')) return { issues: [{ message: 'Email required', path: ['email'] }] };
      if (email === 'reject@example.com') return { issues: [{ message: 'Server rejected email', path: ['email'] }] };
      return { value: { email } };
    },
  },
};
export const saveFieldForm = form(schema, async ({ email }) => ({ email, effectCount: ++effectCount }));
