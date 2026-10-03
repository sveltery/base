// Private, framework-neutral contract derived from Base UI 1.8.0; MIT: parity/anchor-positioning/UPSTREAM_LICENSE.
import type { MiddlewareData, Padding, Placement, Rect, Strategy, VirtualElement } from '@floating-ui/dom';

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
export type Align = 'start' | 'center' | 'end';
export type Boundary = 'clipping-ancestors' | Element | Element[] | Rect;
export type Reference = Element | VirtualElement;
export type Anchor = Reference | null | { current: Reference | null } | (() => Reference | null);
export type OffsetFunction = (data: {
  side: Side; align: Align;
  anchor: { width: number; height: number };
  positioner: { width: number; height: number };
}) => number;
export type CollisionAvoidance =
  | { side?: 'flip' | 'none'; align?: 'flip' | 'shift' | 'none'; fallbackAxisSide?: 'start' | 'end' | 'none' }
  | { side: 'shift'; align?: 'shift' | 'none'; fallbackAxisSide?: 'start' | 'end' | 'none' };

export interface AnchorPositioningOptions {
  open: boolean;
  /** Logical presence, including an exit transition; distinct from an attached keepMounted host. */
  mounted: boolean;
  keepMounted?: boolean;
  anchor?: Anchor;
  positionMethod?: Strategy;
  side?: Side;
  align?: Align;
  sideOffset?: number | OffsetFunction;
  alignOffset?: number | OffsetFunction;
  collisionBoundary?: Boundary;
  collisionPadding?: Padding;
  collisionAvoidance: CollisionAvoidance;
  sticky?: boolean;
  arrowPadding?: number;
  disableAnchorTracking?: boolean;
  shift?: { crossAxis?: boolean; rootBoundary?: 'layoutViewport' };
  /** Output adapter switch used by future Viewport consumers. */
  transform?: boolean;
}

export interface PositioningResult {
  x: number; y: number; placement: Placement;
  strategy: Strategy; middlewareData: MiddlewareData; isPositioned: boolean;
}
