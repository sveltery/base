// Genuine Kit descriptor spreads; no Kit dependency enters the runtime package.
import { form } from '$app/server';
type Data = { enabled?: boolean; choice: string };
type Result = { enabled: boolean; choice: string };
const schema = {
  '~standard': {
    version: 1 as const, vendor: 'input-checked-fixture',
    types: undefined as unknown as { input: Data; output: Result },
    validate(value: unknown): { value: Result } | { issues: { message: string; path: string[] }[] } {
      if (!value || typeof value !== 'object' || ('enabled' in value && value.enabled !== undefined && typeof value.enabled !== 'boolean') || !('choice' in value) || typeof value.choice !== 'string') return { issues: [{ message: 'Choose an option', path: ['choice'] }] };
      return { value: { enabled: 'enabled' in value && value.enabled === true, choice: value.choice } };
    },
  },
};
export const saveChoice = form(schema, async data => data);
