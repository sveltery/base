// Absolute track geometry for a scroll-area scrollbar.
// Derived from Base UI v1.8.0 packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { toCssStyle } from '../internal/css-style.js';
import {
	scrollAreaCornerHeight,
	scrollAreaCornerWidth,
	scrollAreaThumbHeight,
	scrollAreaThumbWidth
} from './css-vars.js';

export function scrollbarTrackStyle(
	vertical: boolean,
	hideUntilMeasured: boolean,
	thumb: { height: number; width: number }
) {
	return toCssStyle({
		position: 'absolute',
		touchAction: 'none',
		WebkitUserSelect: 'none',
		userSelect: 'none',
		visibility: hideUntilMeasured ? 'hidden' : undefined,
		...(vertical
			? {
					top: '0',
					bottom: `var(${scrollAreaCornerHeight})`,
					insetInlineEnd: '0',
					[scrollAreaThumbHeight]: `${thumb.height}px`
				}
			: {
					insetInlineStart: '0',
					insetInlineEnd: `var(${scrollAreaCornerWidth})`,
					bottom: '0',
					[scrollAreaThumbWidth]: `${thumb.width}px`
				})
	});
}
