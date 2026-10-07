export const cases = ['plain', 'labelled', 'range', 'bound', 'disabled', 'vertical'] as const;
export type SliderCase = (typeof cases)[number];
