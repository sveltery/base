export const cases = ['outside', 'omitted', 'nonce', 'disabled', 'reactive', 'nested'] as const;
export type CSPProviderCase = (typeof cases)[number];
