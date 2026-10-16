import { Form } from '@sveltery/base/form';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Form);

export const TypesForm = types;
