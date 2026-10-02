// Real SvelteKit remote form; all Kit dependencies are fixture-only.
import { form } from '$app/server';
type Data = { email: string };
const schema = {
  '~standard': {
    version: 1 as const, vendor: 'input-fixture',
    types: undefined as unknown as { input: Data; output: Data },
    validate(value: unknown): { value: Data } | { issues: { message: string; path: string[] }[] } {
      const email = value && typeof value === 'object' && 'email' in value ? value.email : undefined;
      if (typeof email !== 'string' || !email.includes('@')) return { issues: [{ message: 'Email is required', path: ['email'] }] };
      if (email === 'reject@example.com') return { issues: [{ message: 'Email rejected by server', path: ['email'] }] };
      return { value: { email } };
    },
  },
};
export const saveInput = form(schema, async ({ email }) => ({ email }));
