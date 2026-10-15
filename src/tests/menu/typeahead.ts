import { vi } from 'vitest';

/**
 * Runs `steps` inside one typeahead run. A run ends after `TYPEAHEAD_RESET_MS` of real time, as
 * upstream's `useTypeahead`, so on a loaded runner Playwright's keys can arrive after the run reset
 * and a typed Space then presses the highlighted item. Freezing `setTimeout` holds the run open
 * for all of `steps`. Timeouts set meanwhile never fire.
 */
export async function inOneTypeaheadRun(steps: () => Promise<void>) {
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
	try {
		await steps();
	} finally {
		vi.useRealTimers();
	}
}
