// Type tests, checked by `pnpm check`. Nothing here runs.
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ControlType, EnhanceInstanceOf, FormSource } from '../source.js';
import type { FieldRootProps } from '../../field/types.js';
import { actionForm, type ActionFormEnhanceInstance } from './index.js';

type Input = { email: string; age: number; agree?: boolean; tags?: string[] };
declare const schema: StandardSchemaV1<Input>;
declare const page: { form: { welcome: string } | undefined };

const f = actionForm(schema, () => page.form);

f satisfies FormSource;
f.result?.welcome satisfies string | undefined;

// Form's `enhance` prop receives actionForm's own instance, with its typed `result`.
const instance = {} as EnhanceInstanceOf<typeof f>;
instance satisfies ActionFormEnhanceInstance<Input, { welcome: string }>;
instance.result?.welcome satisfies string | undefined;

f.fields.email.as('email');
f.fields.age.as('number');
f.fields.agree.as('checkbox');
f.fields.tags.as('checkbox', 'svelte');
// @ts-expect-error a misspelled field
void f.fields.emial;
// @ts-expect-error a number field takes no email input
f.fields.age.as('email');
// @ts-expect-error a string field takes no checkbox
f.fields.email.as('checkbox');

'number' satisfies ControlType<typeof f.fields.age>;
// @ts-expect-error `type` on Field.Root must fit the value
'email' satisfies ControlType<typeof f.fields.age>;
({ field: f.fields.email }) satisfies FieldRootProps<typeof f.fields.email>;
// @ts-expect-error a number field needs `type`
({ field: f.fields.age }) satisfies FieldRootProps<typeof f.fields.age>;

// @ts-expect-error a schema with a required boolean cannot pass a form
actionForm({} as StandardSchemaV1<{ agree: boolean }>, () => page.form);
