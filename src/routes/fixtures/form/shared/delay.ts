/**
 * Resolves after `ms`. The fixtures' server handlers and async validator wait on it, so `pending`
 * and a validator's in-flight state last long enough for a test to see them.
 */
export function delay(ms: number) {
	// eslint-disable-next-line sveltery/no-unscoped-timer -- the awaiting request or validation owns this timer.
	return new Promise((resolve) => setTimeout(resolve, ms));
}
