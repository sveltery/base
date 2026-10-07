export const cases = ['default', 'unregistered', 'browser', 'values', 'render'] as const;
export type FormCase = (typeof cases)[number];
