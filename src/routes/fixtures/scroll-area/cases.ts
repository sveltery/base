export const cases = ['both', 'none', 'rtl'] as const;
export type ScrollAreaCase = (typeof cases)[number];
