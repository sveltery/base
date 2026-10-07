export const cases = ['loaded', 'error', 'delay', 'keep', 'prevented'] as const;
export type AvatarCase = (typeof cases)[number];
