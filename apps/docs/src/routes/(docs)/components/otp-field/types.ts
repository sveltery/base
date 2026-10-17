import { OTPField } from '@sveltery/base/otp-field';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, OTPField);

export const TypesOTPField = types;
