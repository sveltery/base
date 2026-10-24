import { Command } from '@sveltery/base/command';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, Command);

export const TypesCommand = types;
export const TypesCommandAdditional = AdditionalTypes;
