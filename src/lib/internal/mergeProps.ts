// Derived from Base UI v1.8.0 packages/react/src/merge-props/mergeProps.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The first bag is the consumer. Its handler runs first. A later handler is skipped
// when that event's defaultPrevented flag is set, matching CollapsibleTrigger and OTP Field.
// Conflicting plain props keep the earliest value. Style resolves so the earliest bag wins.
// Class names concatenate from left to right. Attachment symbols are all kept.

import type { Attachment } from 'svelte/attachments';
import { mergeCssStyle, toCssStyle } from './css-style.js';

type Props = Record<PropertyKey, unknown>;
type Handler = (event: Event) => void;

function isEventHandler(key: PropertyKey, value: unknown): value is Handler {
	if (typeof key !== 'string' || key.length < 3 || !key.startsWith('on')) return false;
	const head = key.charCodeAt(2);
	const letter = (head >= 65 && head <= 90) || (head >= 97 && head <= 122);
	return letter && (typeof value === 'function' || typeof value === 'undefined');
}

function styleString(value: unknown): string | undefined {
	if (typeof value === 'string') return value;
	if (value && typeof value === 'object') {
		return toCssStyle(value as Record<string, string | number | undefined | null>);
	}
	return undefined;
}

export function mergeProps<T extends object>(
	consumer: T | null | undefined,
	...rest: Array<object | null | undefined>
): T {
	const bags = [consumer, ...rest];
	const merged: Props = {};
	const handlers = new Map<string, Handler[]>();
	const classes: string[] = [];
	const styles: string[] = [];
	const attachments = new Map<symbol, Attachment[]>();

	for (const bag of bags) {
		if (!bag) continue;
		const record = bag as Props;
		for (const key of Reflect.ownKeys(record)) {
			const value = record[key];
			if (typeof key === 'string' && isEventHandler(key, value)) {
				if (!value) continue;
				const list = handlers.get(key) ?? [];
				list.push(value);
				handlers.set(key, list);
				continue;
			}
			if (key === 'class' && typeof value === 'string' && value) {
				classes.push(value);
				continue;
			}
			if (key === 'style') {
				const printed = styleString(value);
				if (printed) styles.push(printed);
				continue;
			}
			if (typeof key === 'symbol' && typeof value === 'function') {
				const list = attachments.get(key) ?? [];
				list.push(value as Attachment);
				attachments.set(key, list);
				continue;
			}
			if (!(key in merged)) merged[key] = value;
		}
	}

	for (const [key, list] of handlers) {
		merged[key] = (event: Event) => {
			for (const handler of list) {
				handler(event);
				if (event.defaultPrevented) return;
			}
		};
	}

	if (classes.length > 0) merged.class = classes.join(' ');

	if (styles.length > 0) {
		let style = styles[styles.length - 1];
		for (let index = styles.length - 2; index >= 0; index -= 1) {
			style = mergeCssStyle(style, styles[index]) ?? style;
		}
		merged.style = style;
	}

	for (const [key, list] of attachments) {
		merged[key] =
			list.length === 1
				? list[0]
				: (node: Element) => {
						const cleanups = list.map((attach) => attach(node));
						return () => {
							for (const cleanup of cleanups) {
								if (typeof cleanup === 'function') cleanup();
							}
						};
					};
	}

	return merged as T;
}
