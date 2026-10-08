// Derived from Base UI v1.8.0 packages/react/src/utils/hideMiddleware.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { Middleware } from '@floating-ui/dom';

export const hide: Middleware = {
	name: 'hide',
	async fn(state) {
		const { width, height, x, y } = state.rects.reference;
		const anchorHidden = width === 0 && height === 0 && x === 0 && y === 0;
		const overflow = await state.platform.detectOverflow(state, { elementContext: 'reference' });
		const referenceHidden =
			overflow.top - height >= 0 ||
			overflow.right - width >= 0 ||
			overflow.bottom - height >= 0 ||
			overflow.left - width >= 0;
		return { data: { referenceHidden: referenceHidden || anchorHidden } };
	}
};
