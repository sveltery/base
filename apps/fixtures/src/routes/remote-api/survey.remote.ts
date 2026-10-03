import { form, query } from '$app/server';
type Survey = { storageType: string; enabled: boolean };
type SurveyInput = Omit<Survey, 'enabled'> & { enabled?: boolean };
let effectCount = 0;
export const surveyEffects = query(async () => effectCount);
const schema = {
  '~standard': {
    version: 1 as const,
    vendor: 'remote-api-fixture',
    types: undefined as unknown as { input: SurveyInput; output: Survey },
    validate(value: unknown): { value: Survey } | { issues: { message: string; path: string[] }[] } {
      if (!value || typeof value !== 'object' || !('storageType' in value) || typeof value.storageType !== 'string' || !value.storageType) {
        return { issues: [{ message: 'Storage type required', path: ['storageType'] }] };
      }
      const enabled = 'enabled' in value ? value.enabled : undefined;
      if (enabled !== undefined && typeof enabled !== 'boolean') {
        return { issues: [{ message: 'Boolean required', path: ['enabled'] }] };
      }
      if (value.storageType === 'server-reject') {
        return { issues: [{ message: 'Server storage error', path: ['storageType'] }] };
      }
      return { value: { storageType: value.storageType, enabled: enabled ?? false } };
    },
  },
};
export const survey = form(schema, async (values) => ({ values, effects: ++effectCount }));
