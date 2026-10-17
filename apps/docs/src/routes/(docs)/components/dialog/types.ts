import { Dialog } from '@sveltery/base/dialog';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Dialog);

export const TypesDialog = types;
