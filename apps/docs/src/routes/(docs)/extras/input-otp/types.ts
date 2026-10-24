import { InputOTP } from '@sveltery/base/input-otp';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, InputOTP);

export const TypesInputOTP = types;
