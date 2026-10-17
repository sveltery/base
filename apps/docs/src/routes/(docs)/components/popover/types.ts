import { Popover } from '@sveltery/base/popover';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Popover);

export const TypesPopover = types;
