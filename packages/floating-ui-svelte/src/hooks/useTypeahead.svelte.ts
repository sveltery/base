// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useTypeahead.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { contains, ScopedTimeout } from '@sveltery/utils';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import { isElementVisible } from '../utils/composite.js';
import { stopEvent } from '../utils/event.js';
import { isListIndexDisabled, type DisabledIndices } from '../utils/listIndex.js';

export interface UseTypeaheadProps {
	/** Item labels, by index. Read on every keydown. */
	labels: () => ReadonlyArray<string | null>;
	/**
	 * Item elements, by index. An item whose element is hidden or natively disabled is skipped.
	 */
	elements?: () => ReadonlyArray<HTMLElement | null>;
	/** The active (focused or highlighted) item. */
	activeIndex: number | null;
	onMatch?: (index: number, event: KeyboardEvent) => void;
	/**
	 * Indices to skip while matching, as an array or a predicate. Checked without `elements`, so
	 * items that stay mounted but hidden while closed can still be skipped.
	 */
	disabledIndices?: DisabledIndices;
	onTyping?: (typing: boolean) => void;
	/** @default true */
	enabled?: boolean;
	/**
	 * Milliseconds before the typed string resets.
	 * @default 750
	 */
	resetMs?: number;
	/** @default null */
	selectedIndex?: number | null;
}

type Props = HTMLAttributes<HTMLElement>;

export class Typeahead {
	readonly #timeout = new ScopedTimeout();
	readonly #open: boolean;
	readonly #enabled: boolean;
	readonly #selectedIndex: number | null;
	#string = '';
	#prevIndex: number | null;
	#matchIndex: number | null = null;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly props: () => UseTypeaheadProps
	) {
		this.#open = $derived(store.isOpen());
		this.#enabled = $derived(props().enabled ?? true);
		this.#selectedIndex = $derived(props().selectedIndex ?? null);
		this.#prevIndex = untrack(() => {
			const initial = props();
			return initial.selectedIndex ?? initial.activeIndex ?? -1;
		});

		$effect(() => {
			const open = this.#open;
			const selectedIndex = this.#selectedIndex;
			if (!open && selectedIndex !== null) return;
			untrack(() => {
				this.#timeout.clear();
				this.#matchIndex = null;
				if (this.#string !== '') {
					this.#string = '';
					this.#onTyping(false);
				}
			});
		});
	}

	#onTyping(typing: boolean) {
		this.props().onTyping?.(typing);
	}

	#onKeyDown = (event: KeyboardEvent) => {
		const { labels, elements, activeIndex, onMatch, disabledIndices } = this.props();
		const resetMs = this.props().resetMs ?? 750;
		const selectedIndex = this.props().selectedIndex ?? null;

		const isItemAvailable = (index: number) => {
			const element = elements?.()[index];
			if ((element && !isElementVisible(element)) || element?.matches(':disabled')) return false;
			// Visibility and native disabled state are checked above. The empty list makes
			// `isListIndexDisabled` resolve only the explicit `disabledIndices`.
			return disabledIndices == null || !isListIndexDisabled([], index, disabledIndices);
		};

		const getMatchingIndex = (list: ReadonlyArray<string | null>, text: string, startIndex = 0) => {
			if (list.length === 0) return -1;
			const normalizedStartIndex = ((startIndex % list.length) + list.length) % list.length;
			const lowerText = text.toLowerCase();
			for (let offset = 0; offset < list.length; offset += 1) {
				const index = (normalizedStartIndex + offset) % list.length;
				if (!list[index]?.toLowerCase().startsWith(lowerText) || !isItemAvailable(index)) continue;
				return index;
			}
			return -1;
		};

		const list = labels();

		if (this.#string.length > 0 && event.key === ' ') {
			// Space continues the typing session.
			stopEvent(event);
			this.#onTyping(true);
		}

		if (
			this.#string.length > 0 &&
			this.#string[0] !== ' ' &&
			getMatchingIndex(list, this.#string) === -1 &&
			event.key !== ' '
		) {
			this.#onTyping(false);
		}

		// Character keys only, without modifiers.
		if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

		if (this.store.isOpen() && event.key !== ' ') {
			stopEvent(event);
			this.#onTyping(true);
		}

		const isNewSession = this.#string === '';
		if (isNewSession) this.#prevIndex = selectedIndex ?? activeIndex ?? -1;

		// A label like "llama" or "aaron" disables cycling by first letter. Unavailable items are
		// skipped while matching, so they must not block cycling either.
		const allowRapidSuccessionOfFirstLetter = list.every((text, index) =>
			text && isItemAvailable(index) ? text[0]?.toLowerCase() !== text[1]?.toLowerCase() : true
		);

		// Cycle through items that start with the same letter.
		if (allowRapidSuccessionOfFirstLetter && this.#string === event.key) {
			this.#string = '';
			this.#prevIndex = this.#matchIndex;
		}

		this.#string += event.key;
		this.#timeout.start(resetMs, () => {
			this.#string = '';
			this.#prevIndex = this.#matchIndex;
			this.#onTyping(false);
		});

		// A new session starts after the current item. A continued one after the last match.
		const prevIndex = isNewSession ? (selectedIndex ?? activeIndex ?? -1) : this.#prevIndex;
		const index = getMatchingIndex(list, this.#string, (prevIndex ?? 0) + 1);

		if (index !== -1) {
			onMatch?.(index, event);
			this.#matchIndex = index;
		} else if (event.key !== ' ') {
			this.#string = '';
			this.#onTyping(false);
		}
	};

	#onFocusOut = (event: FocusEvent) => {
		const next = event.relatedTarget as Element | null;
		// Focus moving between the reference and the floating element keeps the session.
		if (
			contains(this.store.domReferenceElement, next) ||
			contains(this.store.floatingElement, next)
		) {
			return;
		}
		this.#timeout.clear();
		this.#string = '';
		this.#prevIndex = this.#matchIndex;
		this.#onTyping(false);
	};

	readonly #handlers: Props = { onkeydown: this.#onKeyDown, onfocusout: this.#onFocusOut };

	get reference(): Props {
		return this.#enabled ? this.#handlers : {};
	}

	get floating(): Props {
		return this.#enabled ? this.#handlers : {};
	}
}
