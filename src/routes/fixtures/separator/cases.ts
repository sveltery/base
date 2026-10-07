export const cases = ['horizontal', 'vertical', 'reactive'] as const;
export type SeparatorCase = (typeof cases)[number];
