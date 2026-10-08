export type OpenCall = { open: boolean; reason: string; canceled: boolean };

export function noteOpen(
	scenario: string,
	open: boolean,
	details: { reason: string; isCanceled: boolean; cancel: () => void }
) {
	if (scenario === 'cancel') details.cancel();
	return { open, reason: details.reason, canceled: details.isCanceled } satisfies OpenCall;
}
