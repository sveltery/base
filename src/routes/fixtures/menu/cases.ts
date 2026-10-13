export const cases = ['basic', 'submenu', 'delay', 'choices', 'hover'] as const;

export type MenuCase = (typeof cases)[number];
