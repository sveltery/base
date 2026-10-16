import { RadioGroup } from '@sveltery/base/radio-group';
import { Radio } from '@sveltery/base/radio';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, { RadioGroup, Radio });

export const TypesRadioGroup = types;
