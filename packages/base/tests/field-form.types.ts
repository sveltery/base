// Form.spec.tsx assertions at immutable Base UI v1.8.0 47b40521; MIT.
// Three source type assertions and separate Svelte public-anatomy supplements earn no ordinary credit.
import type { ComponentProps } from 'svelte';
import { Field, FieldControl } from '../src/lib/field/index.js';
import { Fieldset } from '../src/lib/fieldset/index.js';
import { Form } from '../src/lib/form/index.js';
import { Input } from '../src/lib/input/index.js';
import type { FormProps, FormActions } from '../src/lib/form/index.js';
import type {
  FieldRootProps,
  FieldRootActions,
  FieldValidityState,
} from '../src/lib/field/index.js';
import { expectType } from './expect-type.js';
interface Values {
  name: string;
  age: number;
}
const form: ComponentProps<typeof Form<Values>> = {
  onFormSubmit(values) {
    expectType<string, typeof values.name>(values.name); // Form.spec.tsx:12
    expectType<number, typeof values.age>(values.age); // Form.spec.tsx:13
    // @ts-expect-error The declared form value shape excludes email.
    values.email.startsWith('a');
  },
};
declare const renderProps: Parameters<NonNullable<ComponentProps<typeof Form>['render']>>[0];
expectType<boolean | undefined, typeof renderProps.noValidate>(renderProps.noValidate); // Form.spec.tsx:22
declare const control: ComponentProps<typeof Field.Control>;
expectType<ComponentProps<typeof Input>, typeof control>(control);
expectType<ComponentProps<typeof FieldControl>, typeof control>(control);
declare const values: FieldValidityState;
expectType<boolean | null, typeof values.validity.valid>(values.validity.valid);
const actionsRef: { current: FormActions | null } = { current: null };
const fieldActionsRef: { current: FieldRootActions | null } = { current: null };
const root: FieldRootProps = {
  actionsRef: fieldActionsRef,
  validate: async (_value, allValues) => {
    const name: unknown = allValues.name;
    void name;
    return ['invalid'];
  },
  class: (state) => [state.valid === false && 'invalid', { disabled: state.disabled }],
};
const nativeForm: ComponentProps<typeof Form> = {
  noValidate: false,
  novalidate: true,
  method: 'post',
  actionsRef,
};
const fieldset: ComponentProps<typeof Fieldset.Root> = { disabled: true, name: 'group' };
// @ts-expect-error Actions preserve the pinned source's validate method.
const badAction: FieldRootActions = { reset() {} };
// @ts-expect-error Validation modes remain a closed union.
const badMode: FormProps = { validationMode: 'onInput' };
// @ts-expect-error Boolean noValidate is preserved in native render props.
const badNoValidate: FormProps = { noValidate: 'false' };
const typedForm: FormProps<Values> = form;
void [form, typedForm, root, nativeForm, fieldset, badAction, badMode, badNoValidate];
