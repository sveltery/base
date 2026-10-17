import { Autocomplete } from '@sveltery/base/autocomplete';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Autocomplete);

export const TypesAutocomplete = types;
