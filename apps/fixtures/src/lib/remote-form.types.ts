import type { RemoteForm, RemoteFormFields } from '@sveltejs/kit';
import type { RemoteFieldArguments, RemoteFieldName, RemoteFieldRootProps } from '../../../../packages/base/src/lib/remote-forms/types.js';

type Input = {
  storageType: 'cloud' | 'local';
  size: number;
  enabled: boolean;
  tags: string[];
  upload: File;
  uploads: File[];
  settings?: { label: string; quota: number };
  rows: Array<{ title: string; active: boolean }>;
  value: string;
  issues: number;
  as: boolean;
  set: string;
  allIssues: string;
};
type Props = RemoteFieldRootProps<RemoteFormFields<Input>>;
const accept = (_props: Props) => {};
accept({ name: 'storageType', as: 'password' });
accept({ name: 'storageType', as: 'radio', value: 'cloud' });
accept({ name: 'storageType', as: 'radio', value: 'another-string' });
accept({ name: 'size', as: 'number' });
accept({ name: 'size', as: 'range', value: 2 });
accept({ name: 'size', as: 'hidden', value: 42 });
accept({ name: 'enabled', as: 'checkbox' });
accept({ name: 'enabled', as: 'checkbox', value: false });
accept({ name: 'tags', as: 'checkbox', value: 'svelte' });
accept({ name: 'tags', as: ['select multiple'] });
accept({ name: 'tags[0]', as: 'text' });
accept({ name: 'upload', as: 'file' });
accept({ name: 'uploads', as: ['file multiple'] });
accept({ name: 'uploads[0]', as: 'file' });
accept({ name: 'settings.label', as: 'email' });
accept({ name: 'settings.quota', as: ['hidden', 8] });
accept({ name: 'rows[0].title', as: 'text' });
accept({ name: 'rows[32].active', as: 'checkbox' });
accept({ name: 'value', as: 'text' });
accept({ name: 'issues', as: 'number' });
accept({ name: 'as', as: 'checkbox' });
accept({ name: 'set', as: 'text' });
accept({ name: 'allIssues', as: 'text' });
// @ts-expect-error Typos must not widen the name discriminator.
accept({ name: 'storageTyp', as: 'text' });
// @ts-expect-error String fields cannot be number controls.
accept({ name: 'storageType', as: 'number' });
// @ts-expect-error Boolean fields cannot be radio controls.
accept({ name: 'enabled', as: 'radio', value: 'true' });
// @ts-expect-error Hidden numeric fields require numeric constants.
accept({ name: 'size', as: 'hidden', value: '42' });
// @ts-expect-error Radio options are required.
accept({ name: 'storageType', as: 'radio' });
// @ts-expect-error Array checkboxes require an option.
accept({ name: 'tags', as: 'checkbox' });
// @ts-expect-error File values cannot be supplied.
accept({ name: 'upload', as: 'file', value: 'x' });
// @ts-expect-error Containers are not controls.
accept({ name: 'settings', as: 'text' });
// @ts-expect-error Nested paths preserve their leaf's type.
accept({ name: 'settings.quota', as: 'text' });
// @ts-expect-error Array indices use Kit's bracket syntax.
accept({ name: 'rows.0.title', as: 'text' });
// @ts-expect-error Tuple and separate value forms cannot be combined.
accept({ name: 'size', as: ['hidden', 42], value: 1 });

type Other = RemoteFieldRootProps<RemoteFormFields<{ title: string; count: number }>>;
const other: Other = { name: 'count', as: 'number' };
// @ts-expect-error The namespace must stay bound to its own schema.
const notOther: Other = { name: 'storageType', as: 'text' };

// New public accessor arguments are forwarded through tuple syntax without a copied type map.
type NewFields = { flag: { as(...args: ['checkbox'] | ['checkbox', boolean] | ['checkbox', boolean, boolean]): object } };
const third: RemoteFieldRootProps<NewFields> = { name: 'flag', as: ['checkbox', true, false] };
// @ts-expect-error The forwarded third argument retains the accessor's type.
const badThird: RemoteFieldRootProps<NewFields> = { name: 'flag', as: ['checkbox', true, 'no'] };

type Name = RemoteFieldName<RemoteFormFields<Input>>;
const nestedName: Name = 'rows[4].active';
// @ts-expect-error Root helper methods are not field names when not in the schema.
const helperName: RemoteFieldName<RemoteFormFields<{ title: string }>> = 'value';

declare const remote: RemoteForm<Input, { saved: true }>;
const same: RemoteFieldArguments<typeof remote.fields.size> = ['hidden', 42];
void [other, notOther, third, badThird, nestedName, helperName, same];
