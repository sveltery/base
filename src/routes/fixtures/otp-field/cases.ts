export const cases = ['plain', 'labelled', 'bound', 'grouped', 'disabled', 'required'] as const;
export type OTPFieldCase = (typeof cases)[number];
