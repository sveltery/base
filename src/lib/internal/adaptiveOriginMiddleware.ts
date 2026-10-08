// Derived from Base UI v1.8.0 packages/react/src/utils/adaptiveOriginMiddleware.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { Middleware } from '@floating-ui/dom';
import { getSide } from '@floating-ui/utils';
import { ownerDocument, ownerWindow } from './owner.js';

const DEFAULT_SIDES = { sideX: 'left', sideY: 'top' } as const;

export const adaptiveOriginMiddleware: Middleware = {
	name: 'adaptiveOrigin',
	async fn(state) {
		const {
			x: rawX,
			y: rawY,
			rects: { floating: floatRect },
			elements: { floating },
			platform,
			strategy,
			placement
		} = state;

		const win = ownerWindow(floating);
		const styles = win.getComputedStyle(floating);
		const hasTransition = styles.transitionDuration !== '0s' && styles.transitionDuration !== '';
		if (!hasTransition) return { x: rawX, y: rawY, data: DEFAULT_SIDES };

		const offsetParent = await platform.getOffsetParent?.(floating);
		let offsetDimensions = { width: 0, height: 0 };
		if (strategy === 'fixed' && win.visualViewport) {
			offsetDimensions = {
				width: win.visualViewport.width,
				height: win.visualViewport.height
			};
		} else if (offsetParent === win) {
			const doc = ownerDocument(floating);
			offsetDimensions = {
				width: doc.documentElement.clientWidth,
				height: doc.documentElement.clientHeight
			};
		} else if (offsetParent && (await platform.isElement?.(offsetParent))) {
			offsetDimensions = await platform.getDimensions(offsetParent);
		}

		const currentSide = getSide(placement);
		let x = rawX;
		let y = rawY;
		if (currentSide === 'left') x = offsetDimensions.width - (rawX + floatRect.width);
		if (currentSide === 'top') y = offsetDimensions.height - (rawY + floatRect.height);
		return {
			x,
			y,
			data: {
				sideX: currentSide === 'left' ? 'right' : DEFAULT_SIDES.sideX,
				sideY: currentSide === 'top' ? 'bottom' : DEFAULT_SIDES.sideY
			}
		};
	}
};
