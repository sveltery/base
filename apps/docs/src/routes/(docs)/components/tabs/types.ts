import { Tabs } from '@sveltery/base/tabs';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Tabs);

export const TypesTabs = types;
