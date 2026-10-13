// Type tests, checked by `pnpm check`. Nothing here runs.
import { FieldApi, FormApi } from '@tanstack/svelte-form';
import type { ControlType, FieldHandle } from '../source.js';
import type { FieldRootProps } from '../../field/types.js';
import { tanstackField } from './index.js';

const form = new FormApi({
	defaultValues: { email: '', age: 0, agree: false, tags: [] as string[] }
});
const email = tanstackField(new FieldApi({ form, name: 'email' as const }));
const age = tanstackField(new FieldApi({ form, name: 'age' as const }));
const agree = tanstackField(new FieldApi({ form, name: 'agree' as const }));
const tags = tanstackField(new FieldApi({ form, name: 'tags' as const }));

email satisfies FieldHandle;
email.value() satisfies string;
age.value() satisfies number;

email.as('email');
age.as('number');
agree.as('checkbox');
tags.as('checkbox', 'svelte');
tags.as('select multiple');
// @ts-expect-error a number field takes no email input
age.as('email');
// @ts-expect-error a string field takes no checkbox
email.as('checkbox');
// @ts-expect-error a boolean field takes no number input
agree.as('number');

'switch' satisfies ControlType<typeof agree>;
// @ts-expect-error `type` on Field.Root must fit the value
'email' satisfies ControlType<typeof age>;
// @ts-expect-error a switch carries a boolean, not a list
'switch' satisfies ControlType<typeof tags>;
({ field: email }) satisfies FieldRootProps<typeof email>;
// @ts-expect-error a number field needs `type`
({ field: age }) satisfies FieldRootProps<typeof age>;
