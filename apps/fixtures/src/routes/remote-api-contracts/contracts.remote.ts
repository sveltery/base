// Supplemental public API acceptance against actual SvelteKit 2.70.3.
import { form, query } from '$app/server';

type Issue = { message: string; path: (string | number)[] };
type Validation<Input> = { value: Input } | { issues: Issue[] };
function contractSchema<Input>(validate: (value: unknown) => Validation<Input>): {
  '~standard': { version: 1; vendor: string; types?: { input: Input; output: Input }; validate: typeof validate };
} {
  return { '~standard': { version: 1, vendor: 'remote-api-contracts', validate } };
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry: unknown) => typeof entry === 'string');
}
const counts: Record<string, number> = {};
export const contractEffects = query(async () => ({ ...counts }));
function effect(name: string) { counts[name] = (counts[name] ?? 0) + 1; return counts[name]; }

type Choices = { choices?: string[] };
const choiceSchema = contractSchema<Choices>((value) => {
  const choices = record(value) ? value.choices : undefined;
  if (!strings(choices) || !choices.length || choices.some((choice) => !['red', 'blue'].includes(choice))) {
    return { issues: [{ message: 'Choose red or blue', path: ['choices'] }] };
  }
  return { value: { choices } };
});
export const nativeChoices = form(choiceSchema, async (values) => ({ values, effects: effect('nativeChoices') }));
export const styledChoices = form(choiceSchema, async (values) => ({ values, effects: effect('styledChoices') }));

type Selection = { choice?: string };
const selectionSchema = contractSchema<Selection>((value) => {
  const choice = record(value) ? value.choice : undefined;
  return typeof choice === 'string' && ['red', 'blue'].includes(choice)
    ? { value: { choice } } : { issues: [{ message: 'Choose one color', path: ['choice'] }] };
});
export const nativeRadio = form(selectionSchema, async (values) => ({ values, effects: effect('nativeRadio') }));
export const styledRadio = form(selectionSchema, async (values) => ({ values, effects: effect('styledRadio') }));

type Selects = { single?: string; multiple?: string[]; custom?: string };
export const selects = form(contractSchema<Selects>((value) => {
  if (!record(value) || typeof value.single !== 'string' || typeof value.custom !== 'string' || !strings(value.multiple)) {
    return { issues: [{ message: 'Complete the selects', path: ['single'] }] };
  }
  return { value: { single: value.single, multiple: value.multiple, custom: value.custom } };
}), async (values) => ({ values, effects: effect('selects') }));

type Uploads = { file?: File; files?: File[] };
export const uploads = form(contractSchema<Uploads>((value) => {
  if (!record(value) || !(value.file instanceof File) || !Array.isArray(value.files) || !value.files.every((file: unknown) => file instanceof File)) {
    return { issues: [{ message: 'Choose files', path: ['file'] }] };
  }
  return { value: { file: value.file, files: value.files } };
}), async ({ file, files }) => ({ file: file?.name, files: files?.map((entry) => entry.name), effects: effect('uploads') }));

type Nested = { profile: { email: string }; items: { label: string }[] };
export const nested = form(contractSchema<Nested>((value) => {
  const profile = record(value) && record(value.profile) ? value.profile : undefined;
  const item = record(value) && Array.isArray(value.items) && record(value.items[0]) ? value.items[0] : undefined;
  const issues: Issue[] = [];
  if (typeof profile?.email !== 'string' || profile.email === 'server-reject') issues.push({ message: 'Server email error', path: ['profile', 'email'] });
  if (typeof item?.label !== 'string' || item.label === 'server-reject') issues.push({ message: 'Server indexed error', path: ['items', 0, 'label'] });
  if (issues.length || typeof profile?.email !== 'string' || typeof item?.label !== 'string') return { issues };
  return { value: { profile: { email: profile.email }, items: [{ label: item.label }] } };
}), async (values) => ({ values, effects: effect('nested') }));

type Message = { message: string; intent?: string };
const messageSchema = contractSchema<Message>((value) => {
  if (!record(value) || typeof value.message !== 'string' || value.message === 'server-reject') return { issues: [{ message: 'Server message error', path: ['message'] }] };
  return { value: { message: value.message, ...(typeof value.intent === 'string' ? { intent: value.intent } : {}) } };
});
export const isolated = form(messageSchema, async (values) => ({ values, effects: effect('isolated') }));
export const enhanced = form(messageSchema, async (values) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return { values, effects: effect('enhanced') };
});
