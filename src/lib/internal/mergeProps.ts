// Derived from Base UI v1.8.0 packages/react/src/merge-props/mergeProps.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The rightmost bag wins plain props, and its handler runs first.
// `event.preventBaseUIHandler()` skips the remaining handlers. `preventDefault()` does not.
// `class` is a Svelte class value, merged as an array with the rightmost bag first.
// `style` is a CSS string. The rightmost declaration wins for the same property.
// A function bag receives the props merged so far and replaces them. That function
// chains handlers itself: this helper does not wrap the handlers it returns.
// Attachment symbols are all kept. There is no ref.

import type { Attachment } from 'svelte/attachments';
import type { ClassValue } from 'svelte/elements';
import { mergeCssStyle, toCssStyle } from './css-style.js';

type Props = Record<PropertyKey, unknown>;
type Handler = (...args: unknown[]) => unknown;

export type PropsGetter = (previous: Props) => object | null | undefined;

declare global {
	interface Event {
		preventBaseUIHandler?: () => void;
		baseUIHandlerPrevented?: boolean;
	}
}

export function makeEventPreventable<T extends object>(event: T): T {
	const target = event as Event;
	if (typeof target.preventBaseUIHandler === 'function') return event;
	target.preventBaseUIHandler = () => {
		target.baseUIHandlerPrevented = true;
	};
	return event;
}

function isEventHandler(key: PropertyKey, value: unknown): boolean {
	if (typeof key !== 'string' || key.length < 3 || !key.startsWith('on')) return false;
	const head = key.charCodeAt(2);
	const letter = (head >= 65 && head <= 90) || (head >= 97 && head <= 122);
	return letter && (typeof value === 'function' || typeof value === 'undefined');
}

function isClassValue(value: unknown): value is ClassValue {
	if (typeof value === 'string') return value.length > 0;
	if (Array.isArray(value)) return value.length > 0;
	return value != null && typeof value === 'object';
}

function styleString(value: unknown): string | undefined {
	if (typeof value === 'string') return value || undefined;
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const printed = toCssStyle(value as Record<string, string | number | undefined | null>);
		return printed || undefined;
	}
	return undefined;
}

function mergeClassValue(current: unknown, next: unknown): ClassValue | undefined {
	if (!isClassValue(next)) return isClassValue(current) ? current : undefined;
	if (!isClassValue(current)) return [next];
	const existing = Array.isArray(current) ? current : [current];
	return [next, ...existing];
}

function wrapEventHandler(handler: Handler): Handler {
	return (...args) => {
		const event = args[0];
		if (event instanceof Event) makeEventPreventable(event);
		return handler(...args);
	};
}

function isHandler(value: unknown): value is Handler {
	return typeof value === 'function';
}

function mergeEventHandlers(our: unknown, their: unknown): unknown {
	if (!isHandler(their)) return our;
	if (!isHandler(our)) return wrapEventHandler(their);
	return (...args: unknown[]) => {
		const event = args[0];
		if (event instanceof Event) {
			makeEventPreventable(event);
			const result = their(...args);
			if (!event.baseUIHandlerPrevented) our(...args);
			return result;
		}
		const result = their(...args);
		our(...args);
		return result;
	};
}

function composeAttachments(list: Attachment[]): Attachment {
	if (list.length === 1) return list[0];
	return (node: Element) => {
		const cleanups = list.map((attach) => attach(node));
		return () => {
			for (const cleanup of cleanups) {
				if (typeof cleanup === 'function') cleanup();
			}
		};
	};
}

type Input = object | null | undefined | PropsGetter;

export function mergeProps<T extends object>(a: T | null | undefined | PropsGetter): T;
export function mergeProps<T extends object>(a: Input, b: T | null | undefined | PropsGetter): T;
export function mergeProps<T extends object>(
	a: Input,
	b: Input,
	c: T | null | undefined | PropsGetter
): T;
export function mergeProps<T extends object>(
	a: Input,
	b: Input,
	c: Input,
	d: T | null | undefined | PropsGetter
): T;
export function mergeProps<T extends object>(
	a: Input,
	b: Input,
	c: Input,
	d: Input,
	e: T | null | undefined | PropsGetter
): T;
export function mergeProps<T extends object>(
	a: Input,
	b: Input,
	c: Input,
	d: Input,
	e: Input,
	f: T | null | undefined | PropsGetter
): T;
export function mergeProps(...bags: Input[]): Props {
	const merged: Props = {};
	const attachments = new Map<symbol, Attachment[]>();

	for (const bag of bags) {
		if (bag == null) continue;
		if (typeof bag === 'function') {
			const next = bag({ ...merged }) ?? {};
			for (const key of Reflect.ownKeys(merged)) delete merged[key];
			Object.assign(merged, next);
			attachments.clear();
			continue;
		}

		const record = bag as Props;
		for (const key of Reflect.ownKeys(record)) {
			const value = record[key];
			if (key === 'class') {
				const next = mergeClassValue(merged.class, value);
				if (next === undefined) delete merged.class;
				else merged.class = next;
				continue;
			}
			if (key === 'style') {
				const printed = styleString(value);
				if (!printed) continue;
				const current = typeof merged.style === 'string' ? merged.style : undefined;
				merged.style = mergeCssStyle(current, printed);
				continue;
			}
			if (typeof key === 'symbol' && typeof value === 'function') {
				const list = attachments.get(key) ?? [];
				list.push(value as Attachment);
				attachments.set(key, list);
				merged[key] = composeAttachments(list);
				continue;
			}
			if (typeof key === 'string' && isEventHandler(key, value)) {
				merged[key] = mergeEventHandlers(merged[key], value);
				continue;
			}
			merged[key] = value;
		}
	}

	return merged;
}

/** The consumer class comes first, then the component class. */
export function mergeClass(
	componentClass: unknown,
	consumerClass: unknown
): ClassValue | undefined {
	const merged = mergeProps(
		isClassValue(componentClass) ? { class: componentClass } : null,
		isClassValue(consumerClass) ? { class: consumerClass } : null
	);
	return isClassValue(merged.class) ? merged.class : undefined;
}

type ChainHandler<E extends Event> = (event: E) => void;

/** The consumer handler runs first. `preventBaseUIHandler()` skips the component handler. */
export function chain<E extends Event>(
	component: ChainHandler<E>,
	consumer: ChainHandler<E> | null | undefined
): ChainHandler<E> {
	if (!consumer) return component;
	const merged = mergeProps({ onEvent: component as Handler }, { onEvent: consumer as Handler });
	return merged.onEvent as ChainHandler<E>;
}
