export const cases = ['modal', 'modeless', 'cancel', 'stuck'] as const;
export type OverlayFoundationCase = (typeof cases)[number];
