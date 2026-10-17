import { Toolbar } from '@sveltery/base/toolbar';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Toolbar);

export const TypesToolbar = types;
