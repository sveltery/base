// Derived from @floating-ui/react-dom 2.1.9 `useFloating` (dom 1.8.0).
// MIT, see THIRD_PARTY_NOTICES.md.
// This is the only module that imports `computePosition` and `autoUpdate`.
// Stored coordinates stay raw. Callers round them to device pixels with `roundByDPR`.
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
import { ownerWindow } from '@sveltery/utils';

export type { AutoUpdateOptions, Placement, Strategy, VirtualElement };

export interface FloatingPositionOptions {
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

function activeMiddleware(list: ReadonlyArray<Middleware | null | undefined | false>) {
	return list.filter((item): item is Middleware => !!item);
}

export function roundByDPR(element: Element | null, value: number) {
	const dpr = (element ? ownerWindow(element).devicePixelRatio : 1) || 1;
	return Math.round(value * dpr) / dpr;
}

export class FloatingPosition {
	#data = $state.raw<PositionData>({
		x: 0,
		y: 0,
		placement: 'bottom',
		strategy: 'absolute',
		middlewareData: {},
		isPositioned: false
	});
	#floating = $state<HTMLElement | null>(null);
	/** Raw so the element keeps its identity when effects compare it. */
	#positionedFor = $state.raw<ReferenceElement | null>(null);
	#version = 0;

	readonly data = $derived.by((): PositionData => {
		const current = this.options();
		// A new reference keeps the last coordinates until it is measured, as upstream does.
		// Hovering between detached triggers then moves the popup from where it was.
		const positioned = current.open !== false && current.enabled && this.#positionedFor != null;
		if (positioned && this.#data.isPositioned) return this.#data;
		return {
			x: 0,
			y: 0,
			placement: current.placement,
			strategy: current.strategy,
			middlewareData: {},
			isPositioned: false
		};
	});

	constructor(private readonly options: () => FloatingPositionOptions) {
		$effect(() => {
			const current = options();
			const node = this.#floating;
			const reference = current.reference;
			if (!current.enabled || current.open === false) {
				this.#version += 1;
				this.#positionedFor = null;
				return;
			}
			if (!node || !reference) {
				this.#version += 1;
				return;
			}
			const stop = autoUpdate(reference, node, this.update, current.autoUpdate);
			return () => {
				this.#version += 1;
				stop();
			};
		});
	}

	/** Element the stored coordinates were measured for. Null while closed or disabled. */
	get positionedFor() {
		return this.#positionedFor;
	}

	readonly floatingProps = {
		attach: (node: HTMLElement) => {
			this.#floating = node;
			return () => {
				if (this.#floating === node) this.#floating = null;
			};
		}
	};

	update = () => {
		const current = this.options();
		const reference = current.reference;
		const node = this.#floating;
		if (!reference || !node || !current.enabled || current.open === false) return;
		const id = ++this.#version;
		const middleware = activeMiddleware(current.middleware);
		void computePosition(reference, node, {
			placement: current.placement,
			strategy: current.strategy,
			middleware
		}).then((result) => {
			if (id !== this.#version || this.#floating !== node) return;
			const live = this.options();
			if (live.open === false || live.reference !== reference) return;
			this.#positionedFor = reference;
			this.#data = {
				x: result.x,
				y: result.y,
				placement: result.placement,
				strategy: result.strategy,
				middlewareData: result.middlewareData,
				isPositioned: true
			};
		});
	};
}
