import { Menubar } from '@sveltery/base/menubar';
import { createTypes } from '#lib/docs/create-types.ts';

export const TypesMenubar = createTypes(import.meta.url, Menubar);
