import { MessageScroller } from '@sveltery/base/message-scroller';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, MessageScroller);

export const TypesMessageScroller = types;
