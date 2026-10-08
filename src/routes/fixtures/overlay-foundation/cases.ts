export const cases = ['modal', 'modeless', 'cancel', 'stuck', 'placed', 'hover'] as const;
export type OverlayFoundationCase = (typeof cases)[number];
