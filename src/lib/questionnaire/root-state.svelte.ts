// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/use-questionnaire-root.ts
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

import { createContext, flushSync, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import {
	createQuestionnaireCollection,
	getCollectionDefinitionWarnings,
	getCollectionRegistrationWarnings,
	getInitialItemName
} from './collection.js';
import type { ItemModel } from './item-state.svelte.js';
import type {
	QuestionnaireItemDefinition,
	QuestionnaireItemStatus,
	QuestionnaireRootState,
	QuestionnaireShortcutMode
} from './types.js';
import { getShortcutFromKey, inDocumentOrder, isRadioTarget, isTextEntryTarget } from './utils.js';

export interface RootOptions {
	readonly item: string | undefined;
	readonly defaultItem: string | undefined;
	readonly items: readonly QuestionnaireItemDefinition[] | undefined;
	readonly shortcuts: QuestionnaireShortcutMode | undefined;
	readonly novalidate: boolean;
	/** Writes the active item. `report` is false when the questionnaire only settles on its starting item. */
	select(item: string, report: boolean): void;
}

type FocusTarget = 'item' | 'invalid';

export class QuestionnaireModel {
	readonly #options: RootOptions;
	element = $state.raw<HTMLFormElement>();
	/** Bumped by every child list change, so document order follows a keyed reorder that registers nothing. */
	domVersion = $state(0);
	#registered = $state.raw<ItemModel[]>([]);
	#focusTarget: FocusTarget = 'item';
	/** The active item the last focus pass saw, undefined before the first pass. */
	#seen: string | null | undefined;
	#warned: string[] = [];

	constructor(options: RootOptions) {
		this.#options = options;
	}

	get shortcuts(): QuestionnaireShortcutMode | null {
		return this.#options.shortcuts ?? null;
	}

	get nativeValidation(): boolean {
		return !this.#options.novalidate;
	}

	get initialItem(): string | null {
		return getInitialItemName(this.collection, this.#options.defaultItem);
	}

	collection = $derived.by(() => createQuestionnaireCollection(this.#options.items));
	/** Enabled rendered items in document order. */
	runtime = $derived.by(() => {
		void this.domVersion;
		return inDocumentOrder(this.#registered).filter((item) => !item.disabled);
	});
	/** Enabled item names in navigation order. `items` is authoritative when given. */
	#names = $derived(
		this.collection
			? this.collection.enabledItems.map((item) => item.name)
			: this.runtime.map((item) => item.name)
	);
	/** The requested item, or the first enabled one when the request names no enabled item. */
	activeName = $derived.by(() => {
		const requested = this.#options.item;
		return requested !== undefined && this.#names.includes(requested)
			? requested
			: (this.#names[0] ?? null);
	});
	#index = $derived(this.activeName === null ? -1 : this.#names.indexOf(this.activeName));
	activeItem = $derived(this.runtime.find((item) => item.name === this.activeName));
	state: QuestionnaireRootState = $derived.by(() => {
		const total = this.#names.length;
		return {
			current: this.#index + 1,
			first: total > 0 && this.#index === 0,
			last: total > 0 && this.#index === total - 1,
			total
		};
	});
	activeRequired = $derived.by((): boolean | null => {
		if (this.#index < 0) return null;
		const definition = this.collection?.itemByName.get(this.activeName!);
		return definition ? Boolean(definition.required) : (this.activeItem?.required ?? false);
	});
	activeStatus = $derived<QuestionnaireItemStatus | null>(
		this.#index < 0 ? null : (this.activeItem?.status ?? 'unanswered')
	);
	#warnings = $derived.by(() =>
		this.collection
			? [
					...getCollectionDefinitionWarnings(this.collection, this.#options.defaultItem),
					...getCollectionRegistrationWarnings(this.collection, this.#registered, this.shortcuts)
				]
			: []
	);

	register(item: ItemModel): void {
		this.#registered = [...this.#registered, item];
	}

	unregister(item: ItemModel): void {
		this.#registered = this.#registered.filter((entry) => entry !== item);
	}

	select(name: string, target: FocusTarget = 'item'): void {
		if (name === this.activeName) return;
		this.#focusTarget = target;
		this.#options.select(name, true);
	}

	/** Writes the item shown when the request names none that is enabled, reporting it unless nothing was requested. */
	reconcile(): void {
		const { activeName } = this;
		const requested = this.#options.item;
		if (activeName !== null && activeName !== requested)
			untrack(() => this.#options.select(activeName, requested !== undefined));
	}

	/** Focuses the item navigation lands on. Runs as an effect so the item is visible first. */
	followFocus(): void {
		const name = this.activeName;
		const item = this.activeItem;
		untrack(() => {
			const previous = this.#seen;
			this.#seen = name;
			if (previous === undefined || previous === name) return;
			const target = this.#focusTarget;
			this.#focusTarget = 'item';
			if (target === 'invalid') item?.focusInvalid();
			else item?.focus();
		});
	}

	warn(): void {
		const warnings = this.#warnings;
		untrack(() => {
			warnings.forEach((warning, index) => {
				if (warnings.indexOf(warning) === index && !this.#warned.includes(warning))
					console.warn(`[Questionnaire] ${warning}`);
			});
			this.#warned = warnings;
		});
	}

	goPrevious(): void {
		if (this.#index > 0) this.select(this.#names[this.#index - 1]);
	}

	goNext(): void {
		const item = this.activeItem;
		if (!item || this.#index >= this.#names.length - 1) return;
		if (!item.validate()) item.focusInvalid();
		else this.select(this.#names[this.#index + 1]);
	}

	confirm(): void {
		const item = this.activeItem;
		if (!item) return;
		if (!item.validate()) item.focusInvalid();
		else if (this.state.last) this.element?.requestSubmit();
		else this.select(this.#names[this.#index + 1]);
	}

	skip(): void {
		const item = this.activeItem;
		if (!item || item.required) return;
		item.skip();
		if (!this.state.last) return this.select(this.#names[this.#index + 1]);
		// The skipped answers leave the form data only once the DOM reflects them.
		flushSync();
		this.element?.requestSubmit();
	}

	reset(): void {
		for (const item of this.#registered) item.reset();
		const defaultItem = this.#options.defaultItem;
		const name = this.collection
			? this.initialItem
			: (this.runtime.find((item) => item.name === defaultItem) ?? this.runtime[0])?.name;
		if (name) this.select(name);
	}

	/** Validates every item in navigation order and moves to the first invalid one. Returns whether the submit may go on. */
	submit(): boolean {
		const invalid = this.#names
			.flatMap((name) => this.runtime.filter((item) => item.name === name))
			.find((item) => !item.validate());
		if (!invalid) return true;
		if (invalid.name === this.activeName) invalid.focusInvalid();
		else this.select(invalid.name, 'invalid');
		return false;
	}

	attach: Attachment<HTMLFormElement> = (element) => {
		this.element = element;
		const observer = new MutationObserver(() => this.domVersion++);
		observer.observe(element, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			this.element = undefined;
		};
	};

	keydown(event: KeyboardEvent): void {
		const item = this.activeItem;
		const target = event.target;
		// keyCode 229 marks a key that an input method editor is handling.
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.keyCode === 229 ||
			!item ||
			!(target instanceof Element)
		)
			return;

		if (
			event.key === 'Enter' &&
			(event.metaKey || event.ctrlKey) &&
			!event.altKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			if (!event.repeat) this.confirm();
			return;
		}
		if (event.metaKey || event.ctrlKey || event.altKey) return;

		if (
			(event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
			item.moveAnswerFocus(target, event.key === 'ArrowDown' ? 'next' : 'previous')
		) {
			event.preventDefault();
			return;
		}

		if (
			(event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
			!isTextEntryTarget(target) &&
			!isRadioTarget(target)
		) {
			event.preventDefault();
			if (event.repeat) return;
			if (event.key === 'ArrowLeft') this.goPrevious();
			else if (item.status !== 'unanswered') this.goNext();
			return;
		}

		if (event.key === 'Enter') {
			const answer = item.answers.find((entry) => entry.element === target);
			if (!answer) return;
			event.preventDefault();
			if (!event.repeat && answer.answered) this.confirm();
			return;
		}

		if (!this.shortcuts || isTextEntryTarget(target)) return;
		const shortcut = getShortcutFromKey(event.key, this.shortcuts);
		const answer = shortcut ? item.answerByShortcut(shortcut) : undefined;
		if (!answer?.element) return;
		event.preventDefault();
		if (event.repeat) return;
		answer.element.focus();
		answer.element.click();
	}
}

export const [getRoot, setRoot] = createContext<QuestionnaireModel>();

export type ActionName = 'previous' | 'skip' | 'next' | 'submit';

interface Action {
	label: string;
	type: 'button' | 'submit';
	shortcut: 'Enter' | null;
	visible(root: QuestionnaireModel): boolean;
	run?(root: QuestionnaireModel): void;
}

export const actions: Record<ActionName, Action> = {
	previous: {
		label: 'Previous',
		type: 'button',
		shortcut: null,
		visible: (root) => root.state.total > 1 && !root.state.first,
		run: (root) => root.goPrevious()
	},
	skip: {
		label: 'Skip',
		type: 'button',
		shortcut: null,
		visible: (root) => root.activeRequired === false,
		run: (root) => root.skip()
	},
	next: {
		label: 'Next',
		type: 'button',
		shortcut: 'Enter',
		visible: (root) => root.state.total > 1 && !root.state.last,
		run: (root) => root.goNext()
	},
	submit: {
		label: 'Submit',
		type: 'submit',
		shortcut: 'Enter',
		visible: (root) => root.state.total > 0 && root.state.last
	}
};
