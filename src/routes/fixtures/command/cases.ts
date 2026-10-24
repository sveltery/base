export const cases = ['standalone', 'loop', 'preset'] as const;
export type CommandCase = (typeof cases)[number];
