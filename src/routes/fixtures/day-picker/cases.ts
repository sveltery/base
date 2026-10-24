export const cases = ['single', 'range', 'multiple', 'dropdown', 'weeks'] as const;
export type DayPickerCase = (typeof cases)[number];

export const today = new Date(2025, 5, 18);
