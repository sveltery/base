import type { ComponentProps } from 'svelte';
import { NumberField } from '../src/lib/number-field/index.js';
import type { NumberFieldRootProps, NumberFieldRootState, NumberFieldRootChangeEventDetails } from '../src/lib/number-field/types.js';
import { expectType } from './expect-type.js';
declare const props: ComponentProps<typeof NumberField.Root>;
expectType<NumberFieldRootProps, typeof props>(props);
declare const state: NumberFieldRootState;
expectType<number | null, typeof state.value>(state.value);
expectType<string, typeof state.inputValue>(state.inputValue);
const root: NumberFieldRootProps = { value: null, defaultValue: 2, step: 'any', inputRef: null, locale: ['en-US'], allowOutOfRange: true,
  onValueChange(value, details) { expectType<number | null, typeof value>(value); details.cancel(); const _details: NumberFieldRootChangeEventDetails = details; void _details; },
  onValueCommitted(value, details) { expectType<number | null, typeof value>(value); const event: Event = details.event; void event; },
};
// @ts-expect-error Numeric owner state cannot use a string.
const invalidValue: NumberFieldRootProps = { value: '2' };
// @ts-expect-error The pinned defaultValue excludes null.
const invalidDefault: NumberFieldRootProps = { defaultValue: null };
// @ts-expect-error Change values remain nullable numbers.
const invalidCallback: NumberFieldRootProps = { onValueChange(value: string) { void value; } };
// @ts-expect-error Commit events are generic and cannot cancel changes.
const invalidCommit: NumberFieldRootProps = { onValueCommitted(_value, details) { details.cancel(); } };
void [root, invalidValue, invalidDefault, invalidCallback, invalidCommit];
