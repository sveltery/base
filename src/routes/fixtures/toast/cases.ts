export const cases = ['basic', 'timeout', 'limit', 'anchored'] as const;
export type ToastCase = (typeof cases)[number];

export interface ToastCaseOptions {
	/** The provider's default auto-dismiss time in ms. `0` keeps toasts until they are closed. */
	timeout: number;
	limit: number;
	/** Wraps each toast in `Toast.Positioner`, with a `Toast.Arrow`. */
	anchored: boolean;
}

export const caseOptions: Record<ToastCase, ToastCaseOptions> = {
	basic: { timeout: 0, limit: 3, anchored: false },
	timeout: { timeout: 800, limit: 3, anchored: false },
	limit: { timeout: 0, limit: 2, anchored: false },
	anchored: { timeout: 0, limit: 3, anchored: true }
};
