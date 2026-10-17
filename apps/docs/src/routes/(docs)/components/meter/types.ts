import { Meter } from '@sveltery/base/meter';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Meter);

export const TypesMeter = types;
