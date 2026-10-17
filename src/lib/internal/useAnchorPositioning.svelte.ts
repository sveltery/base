// Derived from Base UI v1.8.0 packages/react/src/internals/useAnchorPositioning.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). The `'placement'` lazy flip follows v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
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
import {
	arrow,
	type Anchor,
	type FloatingRootStore,
	type ReferenceElement,
	FloatingPosition,
	roundByDPR,
	type FloatingPositionOptions
} from '@sveltery/floating-ui-svelte';
import { hide } from './hideMiddleware.js';
import { ownerDocument, ownerWindow } from '@sveltery/utils';

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

export interface AnchorPositioningParameters {
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
	/**
	 * Locks a flipped placement so it does not flip back while the popup resizes. `true` locks
	 * the side. `'placement'` also locks the alignment (Base UI v1.9.0).
	 */
	lazyFlip?: boolean | 'placement';
	inline?: Middleware;
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

export class AnchorPositioning {
	readonly #direction = useDirection();
	#latchedSide = $state<PhysicalSide | null>(null);
	#latchedAlign = $state<Align | null>(null);
	#latchedFor = $state.raw<ReferenceElement | null>(null);
	#arrowElement = $state<HTMLElement | null>(null);
	#measured = $state.raw<Record<string, string>>({});
	readonly #position: FloatingPosition;

	/** The flipped placement this open latched, or null while nothing is latched. */
	readonly #mountPlacement = $derived.by(() => {
		const current = this.read();
		if (!current.mounted) return null;
		const reference = resolveAnchor(current.anchor) ?? this.store.referenceElement;
		if (
			!reference ||
			this.#latchedFor !== reference ||
			this.#position.positionedFor !== reference
		) {
			return null;
		}
		return { side: this.#latchedSide, align: this.#latchedAlign };
	});

	readonly #mountSide = $derived(this.#mountPlacement?.side ?? null);

	readonly isPositioned = $derived.by(
		() => this.#position.data.isPositioned && this.read().mounted
	);

	constructor(
		private readonly store: FloatingRootStore,
		private readonly read: () => AnchorPositioningParameters
	) {
		this.#position = new FloatingPosition(() => this.#floatingOptions());

		$effect(() => {
			const current = this.read();
			if (!current.mounted || !current.lazyFlip || !this.isPositioned) return;
			const reference = resolveAnchor(current.anchor) ?? store.referenceElement;
			if (this.#position.positionedFor !== reference) return;
			const rendered = getSide(this.#position.data.placement);
			const preferred = physicalSide(
				current.side ?? 'bottom',
				this.#direction.direction === 'rtl',
				this.#mountSide
			);
			const lockAlign = current.lazyFlip === 'placement';
			const renderedAlign = getAlignment(this.#position.data.placement) || 'center';
			const preferredAlign = this.#placementAlign(current);
			if (rendered !== preferred || (lockAlign && renderedAlign !== preferredAlign)) {
				this.#latchedSide = rendered;
				this.#latchedAlign = lockAlign ? renderedAlign : null;
				this.#latchedFor = reference;
			}
		});
	}

	#placementAlign(current: AnchorPositioningParameters): Align {
		return (
			(current.lazyFlip === 'placement' && this.#mountPlacement?.align) || current.align || 'center'
		);
	}

	#layout() {
		const current = this.read();
		const isRtl = this.#direction.direction === 'rtl';
		const sideParam = current.side ?? 'bottom';
		const align = this.#placementAlign(current);
		const physical = physicalSide(sideParam, isRtl, this.#mountSide);
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

	#floatingOptions(): FloatingPositionOptions {
		const current = this.#layout();
		const bias = 1;
		const middleware: Array<Middleware | null> = [];
		if (current.current.inline) middleware.push(current.current.inline);
		middleware.push(
			offset((state) => {
				const live = this.#layout();
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
						const live = this.#layout();
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
					const live = this.#layout();
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
										if (!this.#arrowElement) return {};
										const { width, height } = this.#arrowElement.getBoundingClientRect();
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
				const live = this.#layout();
				return {
					boundary: live.boundary,
					padding: live.collisionPadding,
					apply: ({ elements: { floating }, availableWidth, availableHeight, rects }) => {
						if (!this.read().mounted) return;
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
							this.#measured[AVAILABLE_WIDTH_VAR] !== next[AVAILABLE_WIDTH_VAR] ||
							this.#measured[AVAILABLE_HEIGHT_VAR] !== next[AVAILABLE_HEIGHT_VAR] ||
							this.#measured[CommonPositionerCssVars.anchorWidth] !==
								next[CommonPositionerCssVars.anchorWidth] ||
							this.#measured[CommonPositionerCssVars.anchorHeight] !==
								next[CommonPositionerCssVars.anchorHeight]
						) {
							this.#measured = { ...this.#measured, ...next };
						}
					}
				};
			}),
			arrow((state) => {
				const live = this.#layout();
				return {
					element:
						this.#arrowElement || ownerDocument(state.elements.floating).createElement('div'),
					padding: this.#arrowElement ? live.arrowPadding : 0,
					offsetParent: 'floating' as const
				};
			}),
			{
				name: 'transformOrigin',
				fn: (state: MiddlewareState) => {
					const live = this.#layout();
					const renderedSide = getSide(state.placement);
					const renderedAlign = getAlignment(state.placement);
					const isVertical = getSideAxis(renderedSide) === 'y';
					const data = offsetData(state, live.sideParam, live.isRtl);
					const sideOffsetValue =
						typeof live.sideOffset === 'function' ? live.sideOffset(data) : live.sideOffset;
					let crossOrigin: string;
					if (
						!this.#arrowElement &&
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
							? this.#arrowElement?.clientWidth || 0
							: this.#arrowElement?.clientHeight || 0;
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
					if (this.#measured[CommonPositionerCssVars.transformOrigin] !== origin) {
						this.#measured = {
							...this.#measured,
							[CommonPositionerCssVars.transformOrigin]: origin
						};
					}
					return {};
				}
			},
			hide,
			current.current.adaptiveOrigin ?? null
		);

		return {
			reference:
				(current.current.mounted ? resolveAnchor(current.current.anchor) : null) ??
				this.store.referenceElement,
			placement: current.placement,
			strategy: current.current.positionMethod ?? 'absolute',
			middleware,
			open: current.current.mounted,
			enabled: current.current.mounted,
			autoUpdate: anchorAutoUpdateOptions(current.current.disableAnchorTracking)
		};
	}

	#availableSize() {
		return {
			[AVAILABLE_WIDTH_VAR]: this.#measured[AVAILABLE_WIDTH_VAR] ?? '100vw',
			[AVAILABLE_HEIGHT_VAR]: this.#measured[AVAILABLE_HEIGHT_VAR] ?? '100vh'
		};
	}

	resetAvailableSize() {
		const {
			[AVAILABLE_WIDTH_VAR]: _width,
			[AVAILABLE_HEIGHT_VAR]: _height,
			...rest
		} = this.#measured;
		this.#measured = rest;
	}

	get positionerStyles(): Record<string, string> {
		if (!this.isPositioned) {
			return {
				position: 'fixed',
				top: '0',
				left: '0',
				opacity: '0',
				...this.#measured,
				...this.#availableSize()
			};
		}
		const current = this.read();
		const data = this.#position.data;
		const method = current.positionMethod ?? 'absolute';
		const node = this.store.positionerElement;
		const x = roundByDPR(node, data.x);
		const y = roundByDPR(node, data.y);
		const shared = { ...this.#measured, ...this.#availableSize() };
		if (!current.adaptiveOrigin) {
			const dpr = (node ? ownerWindow(node).devicePixelRatio : 1) || 1;
			return {
				position: method,
				left: '0',
				top: '0',
				transform: `translate(${x}px, ${y}px)`,
				...(dpr >= 1.5 ? { willChange: 'transform' } : {}),
				...shared
			};
		}
		const adaptive = data.middlewareData.adaptiveOrigin as
			{ sideX?: string; sideY?: string } | undefined;
		return {
			position: method,
			[adaptive?.sideX ?? 'left']: `${x}px`,
			[adaptive?.sideY ?? 'top']: `${y}px`,
			...shared
		};
	}

	get arrowStyles(): Record<string, string> {
		const arrowData = this.#position.data.middlewareData.arrow;
		return {
			position: 'absolute',
			top: arrowData?.y == null ? '' : `${arrowData.y}px`,
			left: arrowData?.x == null ? '' : `${arrowData.x}px`
		};
	}

	get arrowUncentered() {
		return this.#position.data.middlewareData.arrow?.centerOffset !== 0;
	}

	get side(): Side {
		const rendered = getSide(this.#position.data.placement);
		return logicalSide(this.read().side ?? 'bottom', rendered, this.#direction.direction === 'rtl');
	}

	get align(): Align {
		return getAlignment(this.#position.data.placement) || 'center';
	}

	get physicalSide(): PhysicalSide {
		return getSide(this.#position.data.placement);
	}

	get anchorHidden() {
		return Boolean(this.#position.data.middlewareData.hide?.referenceHidden);
	}

	readonly positionerProps: { attach: Attachment<HTMLElement> } = {
		attach: (node) => {
			const { store } = this;
			node.style.setProperty(AVAILABLE_WIDTH_VAR, '100vw');
			node.style.setProperty(AVAILABLE_HEIGHT_VAR, '100vh');
			store.positionerElement = node;
			if (store.floatingElementKind === 'positioner') store.floatingElement = node;
			const stop = this.#position.floatingProps.attach(node);
			return () => {
				if (typeof stop === 'function') stop();
				if (store.positionerElement === node) store.positionerElement = null;
				if (store.floatingElement === node) store.floatingElement = null;
				this.#measured = {};
			};
		}
	};

	readonly arrowProps: { attach: Attachment<HTMLElement> } = {
		attach: (node) => {
			this.#arrowElement = node;
			this.#position.update();
			return () => {
				if (this.#arrowElement === node) this.#arrowElement = null;
			};
		}
	};
}
