import { Progress } from '@sveltery/base/progress';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Progress);

export const TypesProgress = types;
