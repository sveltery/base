import { Toast } from '@sveltery/base/toast';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Toast);

export const TypesToast = types;
