import { Avatar } from '@sveltery/base/avatar';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, Avatar);

export const TypesAvatar = types;
export const TypesAvatarAdditional = AdditionalTypes;
