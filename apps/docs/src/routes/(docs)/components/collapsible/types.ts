import { Collapsible } from '@sveltery/base/collapsible';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Collapsible);

export const TypesCollapsible = types;
