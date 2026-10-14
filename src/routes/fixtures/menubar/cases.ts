export const cases = ['basic', 'vertical', 'no-loop', 'disabled', 'disabled-trigger'] as const;

export type MenubarCase = (typeof cases)[number];
