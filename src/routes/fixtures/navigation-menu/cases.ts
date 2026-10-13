export const cases = ['standalone', 'delays', 'vertical', 'nested', 'bound'] as const;

export type NavigationMenuCase = (typeof cases)[number];
