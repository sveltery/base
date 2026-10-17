import { ScrollArea } from '@sveltery/base/scroll-area';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, ScrollArea);

export const TypesScrollArea = types;
