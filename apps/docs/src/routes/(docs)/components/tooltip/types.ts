import { Tooltip } from '@sveltery/base/tooltip';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Tooltip);

export const TypesTooltip = types;
