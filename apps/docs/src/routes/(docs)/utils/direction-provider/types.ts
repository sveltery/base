import { DirectionProvider } from '@sveltery/base/direction-provider';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, DirectionProvider);

export const TypesDirectionProvider = types.DirectionProvider;
