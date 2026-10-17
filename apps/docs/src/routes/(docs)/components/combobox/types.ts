import { Combobox } from '@sveltery/base/combobox';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Combobox);

export const TypesCombobox = types;
