import { Drawer } from '@sveltery/base/drawer';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Drawer);

export const TypesDrawer = types;
