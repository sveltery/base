// Exact pinned Base UI 1.8.0 business fixture; MIT: parity/navigation-menu/UPSTREAM_LICENSE.
// Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; test-only import/type transport.
import { size, type SizeOptions } from '@floating-ui/dom';
import { ownerWindow } from './owner.js';
import * as CommonPositionerCssVars from './CommonPositionerCssVars.js';
const AVAILABLE_WIDTH_VAR = CommonPositionerCssVars.availableWidth;
const AVAILABLE_HEIGHT_VAR = CommonPositionerCssVars.availableHeight;

// Complete original size middleware expression and its captured dependencies.
// mountedRef replaces only the owning hook's existing useValueAsRef input boundary.
// Preserve the complete immutable pinned source body/expression.
// prettier-ignore
export function originalSizeMiddleware(mountedRef: { current: boolean }, commonCollisionProps: Pick<SizeOptions, 'boundary' | 'padding'>) {
  return size({
      ...commonCollisionProps,
      apply({ elements: { floating }, availableWidth, availableHeight, rects }) {
        if (!mountedRef.current) {
          return;
        }

        const floatingStyle = floating.style;
        floatingStyle.setProperty(AVAILABLE_WIDTH_VAR, `${availableWidth}px`);
        floatingStyle.setProperty(AVAILABLE_HEIGHT_VAR, `${availableHeight}px`);

        // Snap anchor dimensions to device pixels to ensure the popup's visual width matches the anchor's one.
        const dpr = ownerWindow(floating).devicePixelRatio || 1;
        const { x, y, width, height } = rects.reference;
        const anchorWidth = (Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr;
        const anchorHeight = (Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr;

        floatingStyle.setProperty(CommonPositionerCssVars.anchorWidth, `${anchorWidth}px`);
        floatingStyle.setProperty(CommonPositionerCssVars.anchorHeight, `${anchorHeight}px`);
      },
    });
}
