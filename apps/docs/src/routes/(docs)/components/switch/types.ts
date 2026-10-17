import { Switch } from '@sveltery/base/switch';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, Switch);

export const TypesSwitch = types;
