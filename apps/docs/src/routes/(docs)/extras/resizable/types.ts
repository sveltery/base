import { Resizable } from '@sveltery/base/resizable';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Resizable);

export const TypesResizable = types;
