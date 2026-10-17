import { Menu } from '@sveltery/base/menu';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Menu);

export const TypesMenu = types;
