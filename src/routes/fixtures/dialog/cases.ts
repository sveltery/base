export const cases = ['standalone', 'outside', 'cancel', 'disabled', 'nested', 'focus'] as const;
export type DialogCase = (typeof cases)[number];
