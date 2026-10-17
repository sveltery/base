import { Select } from '@sveltery/base/select';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Select);

export const TypesSelect = types;
