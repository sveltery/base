// Derived from @floating-ui/react-dom 2.1.9 `useFloating` (dom 1.8.0).
// MIT, see THIRD_PARTY_NOTICES.md.
// This is the only module that imports `computePosition` and `autoUpdate`.

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

export type { AutoUpdateOptions, Placement, Strategy, VirtualElement };

export interface UsePositionOptions {
	reference: ReferenceElement | null;
	placement: Placement;
	strategy: Strategy;
	middleware: ReadonlyArray<Middleware | null | undefined | false>;
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
	readonly floatingStyles: Record<string, string | number>;
	readonly floatingProps: { attach: Attachment<HTMLElement> };
	update(): void;
}

function sameValue(left: unknown, right: unknown): boolean {
	if (Object.is(left, right)) return true;
	if (typeof left !== typeof right) return false;
	if (typeof left === 'function' && typeof right === 'function') {
		return left.toString() === right.toString();
	}
	if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
		return left !== left && right !== right;
	}
	if (Array.isArray(left) || Array.isArray(right)) {
		if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
		return left.every((item, index) => sameValue(item, right[index]));
	}
	const leftRecord = left as Record<string, unknown>;
	const rightRecord = right as Record<string, unknown>;
	const keys = Object.keys(leftRecord);
	if (keys.length !== Object.keys(rightRecord).length) return false;
	return keys.every(
		(key) =>
			Object.prototype.hasOwnProperty.call(rightRecord, key) &&
			sameValue(leftRecord[key], rightRecord[key])
	);
}

function activeMiddleware(list: ReadonlyArray<Middleware | null | undefined | false>) {
	return list.filter((item): item is Middleware => !!item);
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
	let middleware = $state.raw<Middleware[]>([]);
	let floating = $state<HTMLElement | null>(null);
	let version = 0;

	$effect.pre(() => {
		const next = activeMiddleware(options().middleware);
		if (!sameValue(middleware, next)) middleware = next;
	});

	function update() {
		const current = options();
		const reference = current.reference;
		const node = floating;
		if (!reference || !node || !current.enabled) return;
		const id = ++version;
		void computePosition(reference, node, {
			placement: current.placement,
			strategy: current.strategy,
			middleware
		}).then((result) => {
			if (id !== version || floating !== node) return;
			const open = options().open;
			data = {
				x: result.x,
				y: result.y,
				placement: result.placement,
				strategy: result.strategy,
				middlewareData: result.middlewareData,
				isPositioned: open !== false
			};
		});
	}

	$effect(() => {
		if (options().open) return;
		if (!data.isPositioned) return;
		version += 1;
		data = { ...data, isPositioned: false };
	});

	$effect(() => {
		const current = options();
		const node = floating;
		if (!node || !current.reference || !current.enabled || current.open === false) return;
		return autoUpdate(current.reference, node, update, current.autoUpdate);
	});

	function attach(node: HTMLElement) {
		floating = node;
		return () => {
			if (floating === node) floating = null;
		};
	}

	return {
		get data() {
			return data;
		},
		get floatingStyles() {
			return {
				position: data.strategy,
				top: `${data.y}px`,
				left: `${data.x}px`
			};
		},
		get floatingProps() {
			return { attach };
		},
		update
	};
}
