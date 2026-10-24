export const cases = ['base', 'props', 'with-on-complete', 'with-autofocus'] as const;
export type InputOTPCase = (typeof cases)[number];
