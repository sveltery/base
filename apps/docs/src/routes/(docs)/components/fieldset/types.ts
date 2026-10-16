import { Fieldset } from '@sveltery/base/fieldset';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Fieldset);

export const TypesFieldset = types;
