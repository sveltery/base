export const cases = ['uncontrolled', 'controlled', 'cancel', 'disabled', 'prevent-base'] as const;
export type ToggleCase = (typeof cases)[number];
