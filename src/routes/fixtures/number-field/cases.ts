export const cases = ['plain', 'labelled', 'bound', 'formatted', 'disabled', 'required'] as const;
export type NumberFieldCase = (typeof cases)[number];
