import { Input } from '@sveltery/base/input';
import { createTypes } from '#lib/docs/create-types.ts';

export const TypesInput = createTypes(import.meta.url, Input);
