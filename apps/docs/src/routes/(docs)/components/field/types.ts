import { Field } from '@sveltery/base/field';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Field);

export const TypesField = types;
