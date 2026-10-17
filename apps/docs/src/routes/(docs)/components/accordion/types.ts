import { Accordion } from '@sveltery/base/accordion';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Accordion);

export const TypesAccordion = types;
