import { NavigationMenu } from '@sveltery/base/navigation-menu';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, NavigationMenu);

export const TypesNavigationMenu = types;
