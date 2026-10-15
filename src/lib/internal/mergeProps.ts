// Derived from Base UI v1.9.0 packages/react/src/merge-props/mergeProps.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The rightmost bag wins plain props, and its handler runs first.
// `event.preventDefault()` in a handler skips the handlers to its left, also for an event that
// is not cancelable. An event that was already prevented before the merged handler ran still
// reaches every handler.
// The event check is the event's shape, so an iframe event still gets the skip signal.
// `class` is a Svelte class value, merged as an array with the rightmost bag first.
// `style` is a CSS string. The rightmost declaration wins for the same property.
// A function bag receives the props merged so far and replaces them. That function
// chains handlers itself: this helper does not wrap the handlers it returns.
// Attachment symbols are all kept. There is no ref.

import type { Attachment } from 'svelte/attachments';
import type { ClassValue } from 'svelte/elements';
import { mergeCssStyle } from './css-style.js';

type Props = Record<PropertyKey, unknown>;
type Handler = (...args: unknown[]) => unknown;

export type PropsGetter = (previous: Props) => object | null | undefined;

/** Svelte handler props are lowercase, such as `onclick`. `onClick` is a plain prop. */
function isEventHandler(key: PropertyKey, value: unknown): boolean {
	if (typeof key !== 'string' || key.length < 3 || !key.startsWith('on')) return false;
	const head = key.charCodeAt(2);
	return head >= 97 && head <= 122 && (typeof value === 'function' || typeof value === 'undefined');
}

function isClassValue(value: unknown): value is ClassValue {
	if (typeof value === 'string') return value.length > 0;
	if (Array.isArray(value)) return value.length > 0;
	return value != null && typeof value === 'object';
}

function mergeClassValue(current: unknown, next: unknown): ClassValue | undefined {
	if (!isClassValue(next)) return isClassValue(current) ? current : undefined;
	if (!isClassValue(current)) return [next];
	const existing = Array.isArray(current) ? current : [current];
	return [next, ...existing];
}

/**
 * `instanceof Event` is false for an event created in another window.
 * An iframe event still has a string `type` and `preventDefault`.
 */
function isDomEvent(value: unknown): value is Event {
	if (value == null || typeof value !== 'object') return false;
	const event = value as Event;
	return typeof event.type === 'string' && typeof event.preventDefault === 'function';
}

function isHandler(value: unknown): value is Handler {
	return typeof value === 'function';
}

function mergeEventHandlers(our: unknown, their: unknown): unknown {
	if (!isHandler(their)) return our;
	if (!isHandler(our)) return their;
	return (...args: unknown[]) => {
		const event = args[0];
		if (!isDomEvent(event) || event.defaultPrevented) {
			const result = their(...args);
			our(...args);
			return result;
		}
		// An event that is not cancelable, such as a typed `input`, keeps `defaultPrevented` false,
		// so the handler's call to `preventDefault()` is recorded here.
		const own = Object.getOwnPropertyDescriptor(event, 'preventDefault');
		const preventDefault = event.preventDefault;
		let prevented = false;
		event.preventDefault = () => {
			prevented = true;
			preventDefault.call(event);
		};
		let result: unknown;
		try {
			result = their(...args);
		} finally {
			if (own) Object.defineProperty(event, 'preventDefault', own);
			else delete (event as Partial<Event>).preventDefault;
		}
		if (!prevented && !event.defaultPrevented) our(...args);
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
	return mergePropsN(bags);
}

/** `mergeProps` for a list of bags. */
export function mergePropsN<T extends object>(bags: readonly Input[]): T;
export function mergePropsN(bags: readonly Input[]): Props {
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
				if (typeof value !== 'string' || !value) continue;
				const current = typeof merged.style === 'string' ? merged.style : undefined;
				merged.style = mergeCssStyle(current, value);
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

/** The consumer handler runs first. `preventDefault()` skips the component handler. */
export function chain<E extends Event>(
	component: ChainHandler<E>,
	consumer: ChainHandler<E> | null | undefined
): ChainHandler<E> {
	if (!consumer) return component;
	const merged = mergeProps({ onevent: component as Handler }, { onevent: consumer as Handler });
	return merged.onevent as ChainHandler<E>;
}
