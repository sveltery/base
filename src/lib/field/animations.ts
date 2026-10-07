// Derived from Base UI v1.8.0 packages/react/src/internals/useAnimationsFinished.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

const STARTING_STYLE = 'data-starting-style';

/**
 * Runs `fn` once animations on `element` finish. A canceled animation waits for
 * its replacement. `waitForStartingStyleRemoved` matches an opening element.
 */
export function runOnceAnimationsFinish(
	element: HTMLElement,
	fn: () => void,
	signal: AbortSignal | null,
	waitForStartingStyleRemoved: boolean
) {
	if (signal?.aborted) return;

	const disabled = (globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean })
		.BASE_UI_ANIMATIONS_DISABLED;
	if (typeof element.getAnimations !== 'function' || disabled) {
		fn();
		return;
	}

	const exec = () => {
		Promise.all(element.getAnimations().map((animation) => animation.finished)).then(
			() => {
				if (!signal?.aborted) fn();
			},
			() => {
				if (signal?.aborted) return;
				const current = element.getAnimations();
				if (current.some((animation) => animation.pending || animation.playState !== 'finished')) {
					exec();
					return;
				}
				fn();
			}
		);
	};

	if (waitForStartingStyleRemoved) {
		if (!element.hasAttribute(STARTING_STYLE)) {
			const frame = requestAnimationFrame(() => {
				if (!signal?.aborted) exec();
			});
			signal?.addEventListener('abort', () => cancelAnimationFrame(frame), { once: true });
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

	const frame = requestAnimationFrame(() => {
		if (!signal?.aborted) exec();
	});
	signal?.addEventListener('abort', () => cancelAnimationFrame(frame), { once: true });
}
