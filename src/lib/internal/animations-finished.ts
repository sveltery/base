// Derived from Base UI v1.8.0 packages/react/src/internals/useAnimationsFinished.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Completions that become ready in the same turn unmount together.

import { useAnimationFrame } from './timeout.svelte.js';

let pending: Array<() => void> | null = null;

function runTogether(fn: () => void) {
	if (!pending) {
		const callbacks: Array<() => void> = [];
		pending = callbacks;
		queueMicrotask(() => {
			pending = null;
			for (const callback of callbacks) callback();
		});
	}
	pending.push(fn);
}

const STARTING_STYLE = 'data-starting-style';

/**
 * Runs `fn` once animations on `element` finish. A canceled animation waits for
 * its replacement. `batch` groups completions that become ready in the same turn.
 * `waitForStartingStyleRemoved` waits for `data-starting-style` to leave before
 * watching animations. The two flags are independent. `useOpenChangeComplete`
 * passes `batch` through and sets the wait flag when `open` is true. Checkbox
 * and Radio batch the exit and leave the wait flag false. Field error and the
 * collapsible open path wait and pass `batch` false.
 */
export function runOnceAnimationsFinish(
	element: HTMLElement,
	fn: () => void,
	signal: AbortSignal | null,
	batch: boolean,
	waitForStartingStyleRemoved = false
) {
	if (signal?.aborted) return;

	const disabled = (globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean })
		.BASE_UI_ANIMATIONS_DISABLED;
	if (typeof element.getAnimations !== 'function' || disabled) {
		fn();
		return;
	}

	const done = () => {
		if (signal?.aborted) return;
		if (!batch) {
			fn();
			return;
		}
		runTogether(() => {
			if (!signal?.aborted) fn();
		});
	};

	const exec = () => {
		if (signal?.aborted) return;
		Promise.all(element.getAnimations().map((animation) => animation.finished)).then(
			() => done(),
			() => {
				if (signal?.aborted) return;
				const current = element.getAnimations();
				if (current.some((animation) => animation.pending || animation.playState !== 'finished')) {
					exec();
					return;
				}
				done();
			}
		);
	};

	if (waitForStartingStyleRemoved) {
		if (!element.hasAttribute(STARTING_STYLE)) {
			const frame = useAnimationFrame();
			frame.request(() => {
				if (!signal?.aborted) exec();
			});
			signal?.addEventListener('abort', () => frame.cancel(), { once: true });
			return;
		}

		const observer = new MutationObserver(() => {
			if (!element.hasAttribute(STARTING_STYLE)) {
				observer.disconnect();
				exec();
			}
		});
		observer.observe(element, { attributes: true, attributeFilter: [STARTING_STYLE] });
		signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
		return;
	}

	const frame = useAnimationFrame();
	frame.request(() => {
		if (!signal?.aborted) exec();
	});
	signal?.addEventListener('abort', () => frame.cancel(), { once: true });
}
