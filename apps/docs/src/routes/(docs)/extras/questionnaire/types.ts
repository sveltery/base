import { Questionnaire } from '@sveltery/base/questionnaire';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Questionnaire);

export const TypesQuestionnaire = types;
