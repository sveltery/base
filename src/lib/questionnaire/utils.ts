// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/utils.ts
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

import type { QuestionnaireShortcutMode } from './types.js';

export function hasInputValue(value: unknown): boolean {
	if (Array.isArray(value)) return value.some((item) => String(item).trim().length > 0);
	return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function getShortcutKeys(shortcuts: QuestionnaireShortcutMode | null | undefined): string[] {
	if (shortcuts === 'letters')
		return Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
	if (shortcuts === 'numbers') return Array.from({ length: 9 }, (_, index) => String(index + 1));
	return [];
}

export function getShortcutFromKey(
	key: string,
	shortcuts: QuestionnaireShortcutMode
): string | null {
	const normalizedKey = shortcuts === 'letters' ? key.toUpperCase() : key;
	return getShortcutKeys(shortcuts).includes(normalizedKey) ? normalizedKey : null;
}

export function getAnswerKeyShortcuts(
	shortcut: string | null,
	filled: boolean
): string | undefined {
	return [shortcut, filled ? 'Enter' : null].filter(Boolean).join(' ') || undefined;
}

export function isTextEntryTarget(element: Element): boolean {
	if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
	if (element instanceof HTMLInputElement)
		return !['button', 'checkbox', 'radio', 'reset', 'submit'].includes(element.type);
	return element instanceof HTMLElement && element.isContentEditable;
}

export function isRadioTarget(element: Element): boolean {
	return element instanceof HTMLInputElement && element.type === 'radio';
}

export function isEmptyNavigableInput(element: HTMLInputElement): boolean {
	return (
		['email', 'password', 'search', 'tel', 'text', 'url'].includes(element.type) &&
		!hasInputValue(element.value)
	);
}

/** Sorts by document position once every entry is in the document, and keeps registration order until then. */
export function inDocumentOrder<T extends { element: Element | undefined }>(
	entries: readonly T[]
): T[] {
	if (!entries.every((entry) => entry.element)) return [...entries];
	return [...entries].sort((first, second) => {
		const position = first.element!.compareDocumentPosition(second.element!);
		if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
		if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
		return 0;
	});
}

/**
 * Turns render state into `data-*` attributes the way the upstream primitives do: `true` is an empty attribute,
 * `false`, `null` and `undefined` are absent, anything else is its string. `pairs` names the attributes a boolean
 * toggles between, such as `checked` to `data-checked` and `data-unchecked`.
 */
export function dataAttributes(
	state: object,
	pairs: Record<string, readonly [string, string]> = {}
): Record<string, string | undefined> {
	const attributes: Record<string, string | undefined> = {};
	for (const [key, value] of Object.entries(state)) {
		const pair = pairs[key];
		if (pair) {
			attributes[`data-${pair[0]}`] = value ? '' : undefined;
			attributes[`data-${pair[1]}`] = value ? undefined : '';
		} else if (typeof value === 'boolean') {
			attributes[`data-${key}`] = value ? '' : undefined;
		} else if (value !== null && value !== undefined) {
			attributes[`data-${key}`] = String(value);
		}
	}
	return attributes;
}
