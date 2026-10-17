import { Toggle } from '@sveltery/base/toggle';
import { createTypes } from '#lib/docs/create-types.ts';

export const TypesToggle = createTypes(import.meta.url, Toggle);
