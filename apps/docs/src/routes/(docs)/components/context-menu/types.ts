import { ContextMenu } from '@sveltery/base/context-menu';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, ContextMenu);

export const TypesContextMenu = types;
