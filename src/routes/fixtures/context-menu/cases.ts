export const cases = ['basic', 'disabled', 'nested'] as const;

export type ContextMenuCase = (typeof cases)[number];
