export const cases = ['standalone', 'snap', 'swipe-area', 'provider', 'nested'] as const;
export type DrawerCase = (typeof cases)[number];
