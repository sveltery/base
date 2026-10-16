import { AlertDialog } from '@sveltery/base/alert-dialog';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, AlertDialog);

export const TypesAlertDialog = types;
