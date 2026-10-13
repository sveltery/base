// Derived from Base UI v1.9.0 packages/react/src/utils/getFiniteAnimations.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

/** Excludes infinite animations, whose finished promises never resolve while they run. */
export function getFiniteAnimations(element: Element, options?: GetAnimationsOptions): Animation[] {
	return element.getAnimations(options).filter((animation) => {
		const timing = animation.effect?.getTiming();
		return timing?.duration !== Infinity && timing?.iterations !== Infinity;
	});
}

/**
 * Resolves once `animation` settles, without its Animation value, so a wait on an
 * unfinished sibling cannot keep a finished animation's target alive.
 */
export function animationSettled(animation: Animation): Promise<void> {
	return animation.finished.then(() => {});
}
