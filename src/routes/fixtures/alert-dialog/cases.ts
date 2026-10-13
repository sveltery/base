export const cases = ['standalone', 'backdrop', 'cancel', 'detached', 'nested', 'open'] as const;
export type AlertDialogCase = (typeof cases)[number];
