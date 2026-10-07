export const cases = ['outside', 'rtl', 'omitted', 'reactive', 'nested'] as const;
export type DirectionProviderCase = (typeof cases)[number];
