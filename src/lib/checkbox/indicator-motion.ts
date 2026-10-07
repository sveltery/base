// Derived from Base UI v1.8.0 packages/react/src/internals/useAnimationsFinished.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Completions that become ready in the same turn unmount together.

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

export function runOnceAnimationsFinish(
	element: HTMLElement,
	fn: () => void,
	signal: AbortSignal,
	batch: boolean
) {
	if (signal.aborted) return;

	const disabled = (globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean })
		.BASE_UI_ANIMATIONS_DISABLED;
	if (typeof element.getAnimations !== 'function' || disabled) {
		fn();
		return;
	}

	const done = () => {
		if (signal.aborted) return;
		if (!batch) {
			fn();
			return;
		}
		runTogether(() => {
			if (!signal.aborted) fn();
		});
	};

	const exec = () => {
		if (signal.aborted) return;
		Promise.all(element.getAnimations().map((animation) => animation.finished)).then(
			() => done(),
			() => {
				if (signal.aborted) return;
				const current = element.getAnimations();
				if (current.some((animation) => animation.pending || animation.playState !== 'finished')) {
					exec();
					return;
				}
				done();
			}
		);
	};

	const frame = requestAnimationFrame(() => {
		if (!signal.aborted) exec();
	});
	signal.addEventListener('abort', () => cancelAnimationFrame(frame), { once: true });
}
