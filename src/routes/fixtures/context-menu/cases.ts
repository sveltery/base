export const cases = ['basic', 'disabled'] as const;

export type ContextMenuCase = (typeof cases)[number];
