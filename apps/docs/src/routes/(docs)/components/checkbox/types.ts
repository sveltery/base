import { Checkbox } from '@sveltery/base/checkbox';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Checkbox);

export const TypesCheckbox = types;
