// Derived from Base UI v1.8.0 packages/react/src/internals/useAnchorPositioning.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `disableAnchorTracking` turns off ancestor scroll, element resize, and layout shift.
// It does not turn off `ancestorResize`. That matches Base UI v1.8.0.

import type { Attachment } from 'svelte/attachments';
import {
	flip,
	limitShift,
	offset,
	shift as floatingShift,
	size,
	type AutoUpdateOptions,
	type Boundary as FloatingBoundary,
	type Middleware,
	type MiddlewareState,
	type Padding,
	type Placement
} from '@floating-ui/dom';
import { getAlignment, getSide, getSideAxis, type Side as PhysicalSide } from '@floating-ui/utils';
import * as CommonPositionerCssVars from './CommonPositionerCssVars.js';
import { useDirection } from './direction-context.js';
import { arrow } from './floating-ui-react/middleware/arrow.js';
import type {
	Anchor,
	FloatingRootStore,
	ReferenceElement
} from './floating-ui-react/components/FloatingRootStore.svelte.js';
import { useBaseUIFloating } from './floating-ui-react/hooks/useFloating.svelte.js';
import { roundByDPR } from './floating-ui-react/usePosition.svelte.js';
import { hide } from './hideMiddleware.js';
import { ownerDocument, ownerWindow } from './owner.js';

const AVAILABLE_WIDTH_VAR = CommonPositionerCssVars.availableWidth;
const AVAILABLE_HEIGHT_VAR = CommonPositionerCssVars.availableHeight;

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
export type Align = 'start' | 'center' | 'end';
export type Boundary =
	| 'clipping-ancestors'
	| Element
	| Element[]
	| { x: number; y: number; width: number; height: number };
export type OffsetFunction = (data: {
	side: Side;
	align: Align;
	anchor: { width: number; height: number };
	positioner: { width: number; height: number };
}) => number;

export interface CollisionAvoidance {
	side?: 'flip' | 'shift' | 'none';
	align?: 'flip' | 'shift' | 'none';
	fallbackAxisSide?: 'start' | 'end' | 'none';
}

export interface UseAnchorPositioningParameters {
	anchor?: Anchor;
	positionMethod?: 'absolute' | 'fixed';
	side?: Side;
	sideOffset?: number | OffsetFunction;
	align?: Align;
	alignOffset?: number | OffsetFunction;
	collisionBoundary?: Boundary;
	collisionPadding?: Padding;
	sticky?: boolean;
	arrowPadding?: number;
	disableAnchorTracking: boolean;
	collisionAvoidance: CollisionAvoidance;
	mounted: boolean;
	adaptiveOrigin?: Middleware;
	shift?: { crossAxis?: boolean; rootBoundary?: 'layoutViewport' };
	lazyFlip?: boolean;
	inline?: Middleware;
}

export interface UseAnchorPositioningReturn {
	readonly positionerStyles: Record<string, string>;
	readonly arrowStyles: Record<string, string>;
	readonly arrowUncentered: boolean;
	readonly side: Side;
	readonly align: Align;
	readonly physicalSide: PhysicalSide;
	readonly anchorHidden: boolean;
	readonly isPositioned: boolean;
	readonly positionerProps: { attach: Attachment<HTMLElement> };
	readonly arrowProps: { attach: Attachment<HTMLElement> };
	readonly anchorTracking: AutoUpdateOptions;
	update(): void;
}

export function anchorAutoUpdateOptions(disableAnchorTracking: boolean): AutoUpdateOptions {
	return {
		ancestorScroll: !disableAnchorTracking,
		elementResize: !disableAnchorTracking && typeof ResizeObserver !== 'undefined',
		layoutShift: !disableAnchorTracking && typeof IntersectionObserver !== 'undefined'
	};
}

function logicalSide(sideParam: Side, renderedSide: PhysicalSide, isRtl: boolean): Side {
	const logical = sideParam === 'inline-start' || sideParam === 'inline-end';
	const logicalRight = isRtl ? 'inline-start' : 'inline-end';
	const logicalLeft = isRtl ? 'inline-end' : 'inline-start';
	const sides: Record<PhysicalSide, Side> = {
		top: 'top',
		right: logical ? logicalRight : 'right',
		bottom: 'bottom',
		left: logical ? logicalLeft : 'left'
	};
	return sides[renderedSide];
}

function offsetData(state: MiddlewareState, sideParam: Side, isRtl: boolean) {
	return {
		side: logicalSide(sideParam, getSide(state.placement), isRtl),
		align: getAlignment(state.placement) || 'center',
		anchor: { width: state.rects.reference.width, height: state.rects.reference.height },
		positioner: { width: state.rects.floating.width, height: state.rects.floating.height }
	} as const;
}

function resolveAnchor(anchor: Anchor | undefined): ReferenceElement | null {
	if (typeof anchor === 'function') return anchor();
	return anchor ?? null;
}

function physicalSide(sideParam: Side, isRtl: boolean, frozen: PhysicalSide | null): PhysicalSide {
	if (frozen) return frozen;
	const sides: Record<Side, PhysicalSide> = {
		top: 'top',
		right: 'right',
		bottom: 'bottom',
		left: 'left',
		'inline-end': isRtl ? 'left' : 'right',
		'inline-start': isRtl ? 'right' : 'left'
	};
	return sides[sideParam];
}

function boundaryOf(value: Boundary | undefined): FloatingBoundary | undefined {
	if (value == null || value === 'clipping-ancestors') {
		return value == null ? undefined : 'clippingAncestors';
	}
	return value;
}

function paddingBox(padding: Padding | undefined) {
	if (typeof padding === 'number' || padding == null) {
		const value = typeof padding === 'number' ? padding : 5;
		return { top: value, right: value, bottom: value, left: value };
	}
	return {
		top: padding.top || 0,
		right: padding.right || 0,
		bottom: padding.bottom || 0,
		left: padding.left || 0
	};
}

export function useAnchorPositioning(
	store: FloatingRootStore,
	params: () => UseAnchorPositioningParameters
): UseAnchorPositioningReturn {
	const direction = useDirection();
	let latchedSide = $state<PhysicalSide | null>(null);
	let arrowElement = $state<HTMLElement | null>(null);
	let measured = $state.raw<Record<string, string>>({});

	function read() {
		return params();
	}

	const mountSide = $derived(read().mounted ? latchedSide : null);

	function layout() {
		const current = read();
		const isRtl = direction.direction === 'rtl';
		const sideParam = current.side ?? 'bottom';
		const align = current.align ?? 'center';
		const physical = physicalSide(sideParam, isRtl, mountSide);
		const collisionPadding = paddingBox(current.collisionPadding ?? 5);
		const avoidance = current.collisionAvoidance;
		const collisionAvoidanceSide = avoidance.side || 'flip';
		const collisionAvoidanceAlign = avoidance.align || 'flip';
		const collisionAvoidanceFallbackAxisSide = avoidance.fallbackAxisSide || 'end';
		const shiftCrossAxis = current.shift?.crossAxis ?? false;
		const sticky = current.sticky ?? false;
		const sideOffset = current.sideOffset ?? 0;
		const alignOffset = current.alignOffset ?? 0;
		const shiftDisabled = collisionAvoidanceAlign === 'none' && collisionAvoidanceSide !== 'shift';
		const crossAxisShiftEnabled =
			!shiftDisabled && (sticky || shiftCrossAxis || collisionAvoidanceSide === 'shift');
		return {
			current,
			isRtl,
			sideParam,
			align,
			physical,
			placement: (align === 'center' ? physical : `${physical}-${align}`) as Placement,
			collisionPadding,
			boundary: boundaryOf(current.collisionBoundary),
			collisionAvoidanceSide,
			collisionAvoidanceAlign,
			collisionAvoidanceFallbackAxisSide,
			shiftCrossAxis,
			sticky,
			sideOffset,
			alignOffset,
			arrowPadding: current.arrowPadding ?? 5,
			crossAxisShiftEnabled
		};
	}

	const position = useBaseUIFloating(store, () => {
		const current = layout();
		const bias = 1;
		const middleware: Array<Middleware | null> = [];
		if (current.current.inline) middleware.push(current.current.inline);
		middleware.push(
			offset((state) => {
				const live = layout();
				const data = offsetData(state, live.sideParam, live.isRtl);
				const sideAxis =
					typeof live.sideOffset === 'function' ? live.sideOffset(data) : live.sideOffset;
				const alignAxis =
					typeof live.alignOffset === 'function' ? live.alignOffset(data) : live.alignOffset;
				return { mainAxis: sideAxis, crossAxis: alignAxis, alignmentAxis: alignAxis };
			})
		);
		const flipMiddleware =
			current.collisionAvoidanceSide === 'none'
				? null
				: flip(() => {
						const live = layout();
						const biasTop = live.sideParam === 'bottom' ? bias : 0;
						const biasBottom = live.sideParam === 'top' ? bias : 0;
						const biasLeft = live.sideParam === 'right' ? bias : 0;
						const biasRight = live.sideParam === 'left' ? bias : 0;
						return {
							boundary: live.boundary,
							padding: {
								top: live.collisionPadding.top + bias + biasTop,
								right: live.collisionPadding.right + bias + biasRight,
								bottom: live.collisionPadding.bottom + bias + biasBottom,
								left: live.collisionPadding.left + bias + biasLeft
							},
							mainAxis: !live.shiftCrossAxis && live.collisionAvoidanceSide === 'flip',
							crossAxis: live.collisionAvoidanceAlign === 'flip' ? 'alignment' : false,
							fallbackAxisSideDirection:
								live.collisionAvoidanceFallbackAxisSide === 'none'
									? undefined
									: live.collisionAvoidanceFallbackAxisSide
						};
					});
		const shiftDisabled =
			current.collisionAvoidanceAlign === 'none' && current.collisionAvoidanceSide !== 'shift';
		const shiftMiddleware = shiftDisabled
			? null
			: floatingShift(() => {
					const live = layout();
					return {
						boundary: live.boundary,
						padding: live.collisionPadding,
						rootBoundary: live.current.shift?.rootBoundary,
						mainAxis: live.collisionAvoidanceAlign !== 'none',
						crossAxis: live.crossAxisShiftEnabled,
						limiter:
							live.sticky || live.shiftCrossAxis
								? undefined
								: limitShift(() => {
										if (!arrowElement) return {};
										const { width, height } = arrowElement.getBoundingClientRect();
										const sideAxis = getSideAxis(live.physical);
										const arrowSize = sideAxis === 'y' ? width : height;
										const offsetAmount =
											sideAxis === 'y'
												? live.collisionPadding.left + live.collisionPadding.right
												: live.collisionPadding.top + live.collisionPadding.bottom;
										return { offset: arrowSize / 2 + offsetAmount / 2 };
									})
					};
				});
		if (
			current.collisionAvoidanceSide === 'shift' ||
			current.collisionAvoidanceAlign === 'shift' ||
			current.align === 'center'
		) {
			middleware.push(shiftMiddleware, flipMiddleware);
		} else {
			middleware.push(flipMiddleware, shiftMiddleware);
		}
		middleware.push(
			size(() => {
				const live = layout();
				return {
					boundary: live.boundary,
					padding: live.collisionPadding,
					apply({ elements: { floating }, availableWidth, availableHeight, rects }) {
						if (!read().mounted) return;
						const next: Record<string, string> = {
							[AVAILABLE_WIDTH_VAR]: `${availableWidth}px`,
							[AVAILABLE_HEIGHT_VAR]: `${availableHeight}px`
						};
						const dpr = ownerWindow(floating).devicePixelRatio || 1;
						const { x, y, width, height } = rects.reference;
						const anchorWidth = (Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr;
						const anchorHeight = (Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr;
						next[CommonPositionerCssVars.anchorWidth] = `${anchorWidth}px`;
						next[CommonPositionerCssVars.anchorHeight] = `${anchorHeight}px`;
						if (
							measured[AVAILABLE_WIDTH_VAR] !== next[AVAILABLE_WIDTH_VAR] ||
							measured[AVAILABLE_HEIGHT_VAR] !== next[AVAILABLE_HEIGHT_VAR] ||
							measured[CommonPositionerCssVars.anchorWidth] !==
								next[CommonPositionerCssVars.anchorWidth] ||
							measured[CommonPositionerCssVars.anchorHeight] !==
								next[CommonPositionerCssVars.anchorHeight]
						) {
							measured = { ...measured, ...next };
						}
					}
				};
			}),
			arrow((state) => {
				const live = layout();
				return {
					element: arrowElement || ownerDocument(state.elements.floating).createElement('div'),
					padding: arrowElement ? live.arrowPadding : 0,
					offsetParent: 'floating' as const
				};
			}),
			{
				name: 'transformOrigin',
				fn(state) {
					const live = layout();
					const renderedSide = getSide(state.placement);
					const renderedAlign = getAlignment(state.placement);
					const isVertical = getSideAxis(renderedSide) === 'y';
					const data = offsetData(state, live.sideParam, live.isRtl);
					const sideOffsetValue =
						typeof live.sideOffset === 'function' ? live.sideOffset(data) : live.sideOffset;
					let crossOrigin: string;
					if (
						!arrowElement &&
						renderedAlign &&
						Math.abs(
							isVertical ? state.middlewareData.shift?.x || 0 : state.middlewareData.shift?.y || 0
						) <= 1
					) {
						crossOrigin =
							(renderedAlign === 'start') ===
							(isVertical && state.platform.isRTL?.(state.elements.floating))
								? '100%'
								: '0%';
					} else {
						const arrowOffset = isVertical
							? state.middlewareData.arrow?.x || 0
							: state.middlewareData.arrow?.y || 0;
						const arrowSize = isVertical
							? arrowElement?.clientWidth || 0
							: arrowElement?.clientHeight || 0;
						crossOrigin = `${arrowOffset + arrowSize / 2}px`;
					}
					let sideOrigin =
						renderedSide === 'top' || renderedSide === 'left'
							? `calc(100% + ${sideOffsetValue}px)`
							: `${-sideOffsetValue}px`;
					if (
						live.crossAxisShiftEnabled &&
						isVertical &&
						Math.abs(state.middlewareData.shift?.y || 0) > sideOffsetValue
					) {
						sideOrigin = `${state.rects.reference.y + state.rects.reference.height / 2 - state.y}px`;
					}
					const origin = isVertical
						? `${crossOrigin} ${sideOrigin}`
						: `${sideOrigin} ${crossOrigin}`;
					if (measured[CommonPositionerCssVars.transformOrigin] !== origin) {
						measured = { ...measured, [CommonPositionerCssVars.transformOrigin]: origin };
					}
					return {};
				}
			},
			hide,
			current.current.adaptiveOrigin ?? null
		);

		return {
			anchor: current.current.mounted ? resolveAnchor(current.current.anchor) : null,
			placement: current.placement,
			strategy: current.current.positionMethod ?? 'absolute',
			middleware,
			open: current.current.mounted,
			enabled: current.current.mounted,
			autoUpdate: anchorAutoUpdateOptions(current.current.disableAnchorTracking)
		};
	});

	const isPositioned = $derived(position.data.isPositioned && read().mounted);

	$effect(() => {
		const current = read();
		void position.positionEpoch;
		const anchor = current.mounted ? resolveAnchor(current.anchor) : null;
		const reference = anchor ?? store.referenceElement;
		if (!current.mounted || position.positionedFor !== reference) {
			latchedSide = null;
			return;
		}
		if (!current.lazyFlip || !isPositioned) return;
		const rendered = getSide(position.data.placement);
		const preferred = physicalSide(
			current.side ?? 'bottom',
			direction.direction === 'rtl',
			mountSide
		);
		if (rendered !== preferred) latchedSide = rendered;
	});

	function availableSize() {
		return {
			[AVAILABLE_WIDTH_VAR]: measured[AVAILABLE_WIDTH_VAR] ?? '100vw',
			[AVAILABLE_HEIGHT_VAR]: measured[AVAILABLE_HEIGHT_VAR] ?? '100vh'
		};
	}

	function positionerStyles() {
		const current = read();
		if (!isPositioned) {
			return { position: 'fixed', top: '0', left: '0', opacity: '0', ...availableSize() };
		}
		const method = current.positionMethod ?? 'absolute';
		const adaptive = current.adaptiveOrigin
			? (position.data.middlewareData.adaptiveOrigin as
					{ sideX?: string; sideY?: string } | undefined)
			: undefined;
		const sideX = adaptive?.sideX ?? 'left';
		const sideY = adaptive?.sideY ?? 'top';
		const node = store.positionerElement;
		return {
			position: method,
			[sideX]: `${roundByDPR(node, position.data.x)}px`,
			[sideY]: `${roundByDPR(node, position.data.y)}px`,
			...measured,
			...availableSize()
		};
	}

	function bindPositioner(node: HTMLElement) {
		node.style.setProperty(AVAILABLE_WIDTH_VAR, '100vw');
		node.style.setProperty(AVAILABLE_HEIGHT_VAR, '100vh');
		store.positionerElement = node;
		if (store.floatingElementKind === 'positioner') store.floatingElement = node;
		const stop = position.floatingProps.attach(node);
		return () => {
			if (typeof stop === 'function') stop();
			if (store.positionerElement === node) store.positionerElement = null;
			if (store.floatingElement === node) store.floatingElement = null;
		};
	}

	function bindArrow(node: HTMLElement) {
		arrowElement = node;
		position.update();
		return () => {
			if (arrowElement === node) arrowElement = null;
		};
	}

	return {
		get positionerStyles() {
			return positionerStyles();
		},
		get arrowStyles() {
			const arrowData = position.data.middlewareData.arrow;
			return {
				position: 'absolute',
				top: arrowData?.y == null ? '' : `${arrowData.y}px`,
				left: arrowData?.x == null ? '' : `${arrowData.x}px`
			};
		},
		get arrowUncentered() {
			return position.data.middlewareData.arrow?.centerOffset !== 0;
		},
		get side() {
			const current = read();
			const rendered = getSide(position.data.placement);
			return logicalSide(current.side ?? 'bottom', rendered, direction.direction === 'rtl');
		},
		get align() {
			return getAlignment(position.data.placement) || 'center';
		},
		get physicalSide() {
			return getSide(position.data.placement);
		},
		get anchorHidden() {
			return Boolean(position.data.middlewareData.hide?.referenceHidden);
		},
		get isPositioned() {
			return isPositioned;
		},
		get positionerProps() {
			return { attach: bindPositioner };
		},
		get arrowProps() {
			return { attach: bindArrow };
		},
		get anchorTracking() {
			return anchorAutoUpdateOptions(read().disableAnchorTracking);
		},
		update() {
			position.update();
		}
	};
}
