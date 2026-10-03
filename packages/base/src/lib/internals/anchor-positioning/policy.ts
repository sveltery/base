// Derived from Base UI 1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
import { autoUpdate, flip, limitShift, offset, shift as floatingShift, size, type Middleware, type MiddlewareState, type Placement, type AutoUpdateOptions, type Side as PhysicalSide } from '@floating-ui/dom';
import { getSide, getAlignment, getSideAxis } from '@floating-ui/utils';
import { baseArrow as arrow } from './arrow.js';
import { hide } from './hide.js';
import * as CommonPositionerCssVars from './css-vars.js';
import type { AnchorPositioningOptions, Side } from './types.js';
const AVAILABLE_WIDTH_VAR = CommonPositionerCssVars.availableWidth;
const AVAILABLE_HEIGHT_VAR = CommonPositionerCssVars.availableHeight;
export function getLogicalSide(sideParam: Side, renderedSide: PhysicalSide, isRtl: boolean): Side {
  const isLogicalSideParam = sideParam === 'inline-start' || sideParam === 'inline-end';
  const logicalRight = isRtl ? 'inline-start' : 'inline-end';
  const logicalLeft = isRtl ? 'inline-end' : 'inline-start';
  return (
    {
      top: 'top',
      right: isLogicalSideParam ? logicalRight : 'right',
      bottom: 'bottom',
      left: isLogicalSideParam ? logicalLeft : 'left',
    } satisfies Record<PhysicalSide, Side>
  )[renderedSide];
}

function getOffsetData(state: MiddlewareState, sideParam: Side, isRtl: boolean) {
  const { rects, placement } = state;
  const data = {
    side: getLogicalSide(sideParam, getSide(placement), isRtl),
    align: getAlignment(placement) || 'center',
    anchor: { width: rects.reference.width, height: rects.reference.height },
    positioner: { width: rects.floating.width, height: rects.floating.height },
  } as const;
  return data;
}

export function createPositioningPolicy(options: AnchorPositioningOptions & { direction?: 'ltr' | 'rtl' }, getArrow: () => Element | null, isCurrent: (floating: HTMLElement) => boolean) {
  const {
    positionMethod = 'absolute', side: sideParam = 'bottom', sideOffset = 0,
    align = 'center', alignOffset = 0, collisionBoundary,
    collisionPadding: collisionPaddingParam = 5, sticky = false, arrowPadding = 5,
    collisionAvoidance, shift,
  } = options;
  const isRtl = options.direction === 'rtl';
  const collisionAvoidanceSide = collisionAvoidance.side || 'flip';
  const collisionAvoidanceAlign = collisionAvoidance.align || 'flip';
  const collisionAvoidanceFallbackAxisSide = collisionAvoidance.fallbackAxisSide || 'end';
  const shiftCrossAxis = shift?.crossAxis ?? false;
  const shiftRootBoundary = shift?.rootBoundary;

  const side =
    (
      {
        top: 'top',
        right: 'right',
        bottom: 'bottom',
        left: 'left',
        'inline-end': isRtl ? 'left' : 'right',
        'inline-start': isRtl ? 'right' : 'left',
      } satisfies Record<Side, PhysicalSide>
    )[sideParam];

  const placement = align === 'center' ? side : (`${side}-${align}` as Placement);

  let collisionPadding = collisionPaddingParam as {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  if (typeof collisionPadding === 'number') {
    collisionPadding = {
      top: collisionPadding,
      right: collisionPadding,
      bottom: collisionPadding,
      left: collisionPadding,
    };
  } else if (collisionPadding) {
    collisionPadding = {
      top: collisionPadding.top || 0,
      right: collisionPadding.right || 0,
      bottom: collisionPadding.bottom || 0,
      left: collisionPadding.left || 0,
    };
  }

  // Create a bias to the preferred side.
  // On iOS, when the mobile software keyboard opens, the input is exactly centered
  // in the viewport, but this can cause it to flip to the top undesirably.
  // The bias is only applied to `flip()` so it doesn't shift the resting position
  // computed by `shift()` and `size()` away from the requested `collisionPadding`.
  const bias = 1;
  const biasTop = sideParam === 'bottom' ? bias : 0;
  const biasBottom = sideParam === 'top' ? bias : 0;
  const biasLeft = sideParam === 'right' ? bias : 0;
  const biasRight = sideParam === 'left' ? bias : 0;

  const commonCollisionProps = {
    boundary: collisionBoundary === 'clipping-ancestors' ? 'clippingAncestors' : collisionBoundary,
    padding: collisionPadding,
  } as const;

  const middleware: Array<Middleware | null | undefined> = [];
  middleware.push(
    offset(
      (state) => {
        const data = getOffsetData(state, sideParam, isRtl);

        const sideAxis =
          typeof sideOffset === 'function'
            ? sideOffset(data)
            : sideOffset;
        const alignAxis =
          typeof alignOffset === 'function'
            ? alignOffset(data)
            : alignOffset;

        return {
          mainAxis: sideAxis,
          crossAxis: alignAxis,
          alignmentAxis: alignAxis,
        };
      },
    ),
  );

  const shiftDisabled = collisionAvoidanceAlign === 'none' && collisionAvoidanceSide !== 'shift';
  const crossAxisShiftEnabled =
    !shiftDisabled && (sticky || shiftCrossAxis || collisionAvoidanceSide === 'shift');

  const flipMiddleware =
    collisionAvoidanceSide === 'none'
      ? null
      : flip({
          ...commonCollisionProps,
          // Ensure the popup flips if it's been limited by its --available-height and it resizes.
          // Since the size() padding is smaller than the flip() padding, flip() will take precedence.
          padding: {
            top: collisionPadding.top + bias + biasTop,
            right: collisionPadding.right + bias + biasRight,
            bottom: collisionPadding.bottom + bias + biasBottom,
            left: collisionPadding.left + bias + biasLeft,
          },
          mainAxis: !shiftCrossAxis && collisionAvoidanceSide === 'flip',
          crossAxis: collisionAvoidanceAlign === 'flip' ? 'alignment' : false,
          fallbackAxisSideDirection: collisionAvoidanceFallbackAxisSide,
        });
  const shiftMiddleware = shiftDisabled
    ? null
    : floatingShift(
        {
          ...commonCollisionProps,
          // Use the Layout Viewport to avoid shifting around when pinch-zooming.
          rootBoundary: shiftRootBoundary,
          mainAxis: collisionAvoidanceAlign !== 'none',
          crossAxis: crossAxisShiftEnabled,
          limiter:
            sticky || shiftCrossAxis
              ? undefined
              : limitShift((limitData) => {
                  const arrowElement = getArrow();
                  if (!arrowElement) {
                    return {};
                  }
                  const { width, height } = arrowElement.getBoundingClientRect();
                  const sideAxis = getSideAxis(getSide(limitData.placement));
                  const arrowSize = sideAxis === 'y' ? width : height;
                  const offsetAmount =
                    sideAxis === 'y'
                      ? collisionPadding.left + collisionPadding.right
                      : collisionPadding.top + collisionPadding.bottom;
                  return {
                    offset: arrowSize / 2 + offsetAmount / 2,
                  };
                }),
        },
      );

  // https://floating-ui.com/docs/flip#combining-with-shift
  if (
    collisionAvoidanceSide === 'shift' ||
    collisionAvoidanceAlign === 'shift' ||
    align === 'center'
  ) {
    middleware.push(shiftMiddleware, flipMiddleware);
  } else {
    middleware.push(flipMiddleware, shiftMiddleware);
  }

  middleware.push(
    size({
      ...commonCollisionProps,
      apply({ elements: { floating }, availableWidth, availableHeight, rects }) {
        if (!isCurrent(floating)) {
          return;
        }

        const floatingStyle = floating.style;
        floatingStyle.setProperty(AVAILABLE_WIDTH_VAR, `${availableWidth}px`);
        floatingStyle.setProperty(AVAILABLE_HEIGHT_VAR, `${availableHeight}px`);

        // Snap anchor dimensions to device pixels to ensure the popup's visual width matches the anchor's one.
        const dpr = floating.ownerDocument.defaultView!.devicePixelRatio || 1;
        const { x, y, width, height } = rects.reference;
        const anchorWidth = (Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr;
        const anchorHeight = (Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr;

        floatingStyle.setProperty(CommonPositionerCssVars.anchorWidth, `${anchorWidth}px`);
        floatingStyle.setProperty(CommonPositionerCssVars.anchorHeight, `${anchorHeight}px`);
      },
    }),
    arrow(
      (state) => ({
        // `transform-origin` calculations rely on an element existing. If the arrow hasn't been set,
        // we'll create a fake element.
        element: getArrow() || state.elements.floating.ownerDocument.createElement('div'),
        // No padding for the fake arrow: it would displace aligned popups on narrow anchors.
        padding: getArrow() ? arrowPadding : 0,
        offsetParent: 'floating',
      }),
    ),
    {
      name: 'transformOrigin',
      async fn(state) {
        const {
          elements: { floating },
          middlewareData,
          placement: renderedPlacement,
          platform,
          rects,
          y,
        } = state;

        const renderedSide = getSide(renderedPlacement);
        const renderedAlign = getAlignment(renderedPlacement);
        const isVertical = getSideAxis(renderedSide) === 'y';
        const arrowEl = getArrow();

        const sideOffsetValue =
          typeof sideOffset === 'function'
            ? sideOffset(getOffsetData(state, sideParam, isRtl))
            : sideOffset;

        // An aligned arrowless popup grows from its aligned edge, until a shift (beyond subpixel)
        // breaks its alignment with the anchor. Everything else grows from the arrow, real or fake.
        let crossOrigin: string;
        if (
          !arrowEl &&
          renderedAlign &&
          Math.abs(isVertical ? middlewareData.shift?.x || 0 : middlewareData.shift?.y || 0) <= 1
        ) {
          // The platform direction, not `isRtl`: it must match what Floating UI placed with.
          crossOrigin =
            (renderedAlign === 'start') === (isVertical && (await platform.isRTL?.(floating)) === true)
              ? '100%'
              : '0%';
        } else {
          const arrowOffset = isVertical
            ? middlewareData.arrow?.x || 0
            : middlewareData.arrow?.y || 0;
          const arrowSize = isVertical ? arrowEl?.clientWidth || 0 : arrowEl?.clientHeight || 0;
          crossOrigin = `${arrowOffset + arrowSize / 2}px`;
        }

        // Side axis: the anchor-facing edge, or the anchor's center when the popup overlaps it.
        let sideOrigin =
          renderedSide === 'top' || renderedSide === 'left'
            ? `calc(100% + ${sideOffsetValue}px)`
            : `${-sideOffsetValue}px`;
        if (
          crossAxisShiftEnabled &&
          isVertical &&
          Math.abs(middlewareData.shift?.y || 0) > sideOffsetValue
        ) {
          sideOrigin = `${rects.reference.y + rects.reference.height / 2 - y}px`;
        }

        if (!isCurrent(floating)) return {};
        floating.style.setProperty(
          CommonPositionerCssVars.transformOrigin,
          isVertical ? `${crossOrigin} ${sideOrigin}` : `${sideOrigin} ${crossOrigin}`,
        );

        return {};
      },
    },
    hide,
  );

  return { placement, strategy: positionMethod, middleware: middleware.filter((item): item is Middleware => item != null) };
}

/** Preserve ancestorResize's default even when anchor tracking is disabled. */
export function getAutoUpdateOptions(floating: HTMLElement, disabled = false): AutoUpdateOptions {
  const win = floating.ownerDocument.defaultView;
  return {
    ancestorScroll: !disabled,
    elementResize: !disabled && typeof win?.ResizeObserver !== 'undefined',
    layoutShift: !disabled && typeof win?.IntersectionObserver !== 'undefined',
  };
}
export { autoUpdate };
