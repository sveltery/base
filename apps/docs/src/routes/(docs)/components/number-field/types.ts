import { NumberField } from '@sveltery/base/number-field';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, NumberField);

export const TypesNumberField = types;
