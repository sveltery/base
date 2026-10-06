// Actual Kit remote schema witness; no library runtime dependency on Kit.
import { form } from '$app/server';
type Values = { amount: number };
let effects = 0;
const schema = {
  '~standard': {
    version: 1 as const,
    vendor: 'number-field-source-fixture',
    types: undefined as unknown as { input: Values; output: Values },
    validate(
      value: unknown,
    ): { value: Values } | { issues: { message: string; path: string[] }[] } {
      const amount =
        value !== null && typeof value === 'object' && 'amount' in value ? value.amount : undefined;
      if (typeof amount !== 'number' || !Number.isFinite(amount))
        return { issues: [{ message: 'A numeric amount is required', path: ['amount'] }] };
      if (amount === 9)
        return { issues: [{ message: 'Server amount unavailable', path: ['amount'] }] };
      return { value: { amount } };
    },
  },
};
export const numberSurvey = form(schema, async (values) => ({ values, effects: ++effects }));
