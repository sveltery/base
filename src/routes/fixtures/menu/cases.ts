export const cases = ['basic', 'submenu', 'delay', 'choices', 'hover', 'filter'] as const;

export type MenuCase = (typeof cases)[number];
