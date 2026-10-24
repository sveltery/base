export const cases = ['horizontal', 'vertical', 'collapsible', 'disabled'] as const;
export type ResizableCase = (typeof cases)[number];
