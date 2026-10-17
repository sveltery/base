import { Form } from '@sveltery/base/form';
import { createTypes } from '#lib/docs/create-types.ts';

export const TypesForm = createTypes(import.meta.url, Form);
