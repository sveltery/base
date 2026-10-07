export const cases = ['standalone', 'bound', 'cancel', 'disabled', 'prevented'] as const;
export type ToggleCase = (typeof cases)[number];
