// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/middleware/arrow.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { Middleware, MiddlewareState } from '@floating-ui/dom';
import {
	clamp,
	evaluate,
	getAlignment,
	getAlignmentAxis,
	getAxisLength,
	getPaddingObject,
	type Padding
} from '@floating-ui/utils';

export interface ArrowOptions {
	element: Element | null;
	padding?: Padding;
	offsetParent?: 'real' | 'floating';
}

export function arrow(
	options: ArrowOptions | ((state: MiddlewareState) => ArrowOptions)
): Middleware {
	return {
		name: 'arrow',
		options,
		async fn(state) {
			const { x, y, placement, rects, platform, elements, middlewareData } = state;
			const resolved = evaluate(options, state);
			const element = resolved?.element ?? null;
			const padding = resolved?.padding ?? 0;
			const offsetParent = resolved?.offsetParent ?? 'real';
			if (element == null) return {};

			const paddingObject = getPaddingObject(padding);
			const coords = { x, y };
			const axis = getAlignmentAxis(placement);
			const length = getAxisLength(axis);
			const arrowDimensions = await platform.getDimensions(element);
			const isYAxis = axis === 'y';
			const minProp = isYAxis ? 'top' : 'left';
			const maxProp = isYAxis ? 'bottom' : 'right';
			const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
			const endDiff =
				rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
			const startDiff = coords[axis] - rects.reference[axis];
			const arrowOffsetParent =
				offsetParent === 'real' ? await platform.getOffsetParent?.(element) : elements.floating;
			let clientSize = elements.floating[clientProp] || rects.floating[length];
			if (!clientSize || !(await platform.isElement?.(arrowOffsetParent))) {
				clientSize = elements.floating[clientProp] || rects.floating[length];
			}

			const centerToReference = endDiff / 2 - startDiff / 2;
			const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
			const minPadding = Math.min(paddingObject[minProp], largestPossiblePadding);
			const maxPadding = Math.min(paddingObject[maxProp], largestPossiblePadding);
			const min = minPadding;
			const max = clientSize - arrowDimensions[length] - maxPadding;
			const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
			const offset = clamp(min, center, max);
			const shouldAddOffset =
				!middlewareData.arrow &&
				getAlignment(placement) != null &&
				center !== offset &&
				rects.reference[length] / 2 -
					(center < min ? minPadding : maxPadding) -
					arrowDimensions[length] / 2 <
					0;
			const alignmentOffset = shouldAddOffset ? (center < min ? center - min : center - max) : 0;

			return {
				[axis]: coords[axis] + alignmentOffset,
				data: {
					[axis]: offset,
					centerOffset: center - offset - alignmentOffset,
					...(shouldAddOffset ? { alignmentOffset } : {})
				},
				reset: shouldAddOffset
			};
		}
	};
}
