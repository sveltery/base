import { Toast } from '@sveltery/base/toast';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, Toast);

export const TypesToast = types;
export const TypesToastAdditional = AdditionalTypes;
