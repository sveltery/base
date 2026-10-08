// Derived from @floating-ui/react-dom 2.1.9 `useFloating` (dom 1.8.0).
// MIT, see THIRD_PARTY_NOTICES.md.
// This is the only module that imports `computePosition` and `autoUpdate`.
// Stored coordinates stay raw. Styles round them to device pixels.
// Middleware is read when positioning runs.

import {
	autoUpdate,
	computePosition,
	type AutoUpdateOptions,
	type Middleware,
	type MiddlewareData,
	type Placement,
	type ReferenceElement,
	type Strategy,
	type VirtualElement
} from '@floating-ui/dom';
import type { Attachment } from 'svelte/attachments';
import { ownerWindow } from '../owner.js';

export type { AutoUpdateOptions, Placement, Strategy, VirtualElement };

export interface UsePositionOptions {
	reference: ReferenceElement | null;
	placement: Placement;
	strategy: Strategy;
	middleware: ReadonlyArray<Middleware | null | undefined | false>;
	/** While this is true the popup stays positioned. Callers pass `mounted`, not `open`. */
	open: boolean;
	enabled: boolean;
	autoUpdate: AutoUpdateOptions;
}

export interface PositionData {
	x: number;
	y: number;
	placement: Placement;
	strategy: Strategy;
	middlewareData: MiddlewareData;
	isPositioned: boolean;
}

export interface UsePositionReturn {
	readonly data: PositionData;
	/** Element the stored coordinates were measured for. Null while unpositioned. */
	readonly positionedFor: ReferenceElement | null;
	/** Bumps when coordinates are stored or cleared. Effects read this, not the element. */
	readonly positionEpoch: number;
	readonly floatingStyles: Record<string, string | number>;
	readonly floatingProps: { attach: Attachment<HTMLElement> };
	update(): void;
}

function activeMiddleware(list: ReadonlyArray<Middleware | null | undefined | false>) {
	return list.filter((item): item is Middleware => !!item);
}

export function roundByDPR(element: Element | null, value: number) {
	const dpr = (element ? ownerWindow(element).devicePixelRatio : 1) || 1;
	return Math.round(value * dpr) / dpr;
}

export function usePosition(options: () => UsePositionOptions): UsePositionReturn {
	let data = $state.raw<PositionData>({
		x: 0,
		y: 0,
		placement: 'bottom',
		strategy: 'absolute',
		middlewareData: {},
		isPositioned: false
	});
	let floating = $state<HTMLElement | null>(null);
	/**
	 * Reference the coordinates belong to. Kept off `$state` so an element is not proxied
	 * into a different identity. `positionEpoch` is what effects subscribe to.
	 */
	let positionedFor: ReferenceElement | null = null;
	let positionEpoch = $state(0);
	let version = 0;
	let cleared = true;

	function clearPosition(placement: Placement, strategy: Strategy) {
		version += 1;
		const hadReference = positionedFor != null;
		positionedFor = null;
		if (cleared && !hadReference) return;
		cleared = true;
		positionEpoch += 1;
		data = {
			x: 0,
			y: 0,
			placement,
			strategy,
			middlewareData: {},
			isPositioned: false
		};
	}

	function update() {
		const current = options();
		const reference = current.reference;
		const node = floating;
		if (!reference || !node || !current.enabled || current.open === false) return;
		const id = ++version;
		const middleware = activeMiddleware(current.middleware);
		void computePosition(reference, node, {
			placement: current.placement,
			strategy: current.strategy,
			middleware
		}).then((result) => {
			if (id !== version || floating !== node) return;
			const live = options();
			if (live.open === false || live.reference !== reference) return;
			cleared = false;
			positionedFor = reference;
			positionEpoch += 1;
			data = {
				x: result.x,
				y: result.y,
				placement: result.placement,
				strategy: result.strategy,
				middlewareData: result.middlewareData,
				isPositioned: true
			};
		});
	}

	$effect(() => {
		const current = options();
		const node = floating;
		const reference = current.reference;
		const closed = current.open === false || !current.enabled;
		const moved = positionedFor != null && positionedFor !== reference;
		if (closed || moved) clearPosition(current.placement, current.strategy);
		if (closed || !node || !reference) return;
		return autoUpdate(reference, node, update, current.autoUpdate);
	});

	const snapshot = $derived(data);

	function attach(node: HTMLElement) {
		floating = node;
		return () => {
			if (floating === node) floating = null;
		};
	}

	return {
		get data() {
			return snapshot;
		},
		get positionedFor() {
			return positionedFor;
		},
		get positionEpoch() {
			return positionEpoch;
		},
		get floatingStyles() {
			return {
				position: data.strategy,
				top: `${roundByDPR(floating, data.y)}px`,
				left: `${roundByDPR(floating, data.x)}px`
			};
		},
		get floatingProps() {
			return { attach };
		},
		update
	};
}
