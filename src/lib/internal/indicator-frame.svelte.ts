import { useAnimationFrame } from './timeout.svelte.js';

/**
 * Clears a status on the next frame while `rendered` is true.
 * Checkbox and Radio indicators share this frame setup.
 */
export function clearStatusOnAnimationFrame(rendered: () => boolean, clear: () => void) {
	const settleFrame = useAnimationFrame();
	$effect(() => {
		if (!rendered()) return;
		settleFrame.request(() => {
			clear();
		});
		return () => settleFrame.cancel();
	});
}
