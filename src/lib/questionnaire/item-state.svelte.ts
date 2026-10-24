// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/use-questionnaire-item.ts,
// use-questionnaire-choice.ts and use-questionnaire-input.ts
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

import { createContext, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLInputAttributes } from 'svelte/elements';
import { chain } from '../internal/mergeProps.js';
import { getShortcutByChoiceValue } from './collection.js';
import type { QuestionnaireModel } from './root-state.svelte.js';
import type { QuestionnaireItemStatus } from './types.js';
import {
	getShortcutKeys,
	hasInputValue,
	inDocumentOrder,
	isEmptyNavigableInput,
	isRadioTarget,
	isTextEntryTarget
} from './utils.js';

export interface ItemOptions {
	readonly name: string;
	readonly required: boolean;
	readonly multiple: boolean;
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly onStatusChange: ((status: QuestionnaireItemStatus) => void) | undefined;
}

export type Answer = ChoiceModel | InputModel;

export class ItemModel {
	readonly root: QuestionnaireModel;
	readonly #options: ItemOptions;
	element = $state.raw<HTMLFieldSetElement>();
	#registered = $state.raw<Answer[]>([]);
	skipped = $state(false);
	/** Set once navigation or submission validated the item, so errors only show after an attempt. */
	attempted = $state(false);
	descriptions = $state.raw<string[]>([]);
	errors = $state.raw<string[]>([]);
	/** The status last reported, undefined until the first report pass records the settled status. */
	#reportedStatus: QuestionnaireItemStatus | undefined;
	#wasMultiple: boolean;

	constructor(root: QuestionnaireModel, options: ItemOptions) {
		this.root = root;
		this.#options = options;
		this.#wasMultiple = options.multiple;
	}

	get name(): string {
		return this.#options.name;
	}
	get required(): boolean {
		return this.#options.required;
	}
	get multiple(): boolean {
		return this.#options.multiple;
	}
	get disabled(): boolean {
		return this.#options.disabled;
	}

	/** Answer controls in document order. */
	controls = $derived.by(() => {
		void this.root.domVersion;
		return inDocumentOrder(this.#registered);
	});
	/** The enabled answer controls, the only ones that count as answers. */
	answers = $derived(this.controls.filter((answer) => !answer.disabled));
	/** The rendered choices, which the dev warnings compare with `items`. */
	choices = $derived(
		this.controls.flatMap((answer) =>
			answer.kind === 'choice' ? [{ value: answer.value, disabled: answer.ownDisabled }] : []
		)
	);
	hasInputAnswer = $derived(this.answers.some((answer) => answer.kind === 'input'));
	#answered = $derived(this.answers.some((answer) => answer.answered));
	status: QuestionnaireItemStatus = $derived(
		this.skipped ? 'skipped' : this.#answered ? 'answered' : 'unanswered'
	);
	#skippedOptional = $derived(this.status === 'skipped' && !this.required);
	valid = $derived.by(
		() =>
			this.disabled ||
			this.#skippedOptional ||
			(!this.#options.invalid && this.status === 'answered')
	);
	invalid = $derived.by(
		() =>
			!this.disabled &&
			!this.#skippedOptional &&
			(this.#options.invalid || (this.attempted && !this.valid))
	);
	message = $derived(
		this.required ? 'Choose an answer to continue.' : 'Choose an answer or skip this question.'
	);
	active = $derived.by(() => !this.disabled && this.root.activeName === this.name);

	/** With `items`, shortcuts follow the definition's choice order. Without it, the enabled choices' document order. */
	#shortcutByValue = $derived.by(() =>
		this.root.collection
			? getShortcutByChoiceValue(
					this.root.collection.itemByName.get(this.name),
					this.root.shortcuts
				)
			: null
	);
	#shortcutKeys = $derived.by(() => getShortcutKeys(this.root.shortcuts));
	#enabledChoices = $derived(this.answers.filter((answer) => answer.kind === 'choice'));

	shortcutOf(choice: ChoiceModel): string | null {
		if (this.#shortcutByValue) return this.#shortcutByValue.get(choice.value) ?? null;
		const index = this.#enabledChoices.indexOf(choice);
		return index < 0 ? null : (this.#shortcutKeys[index] ?? null);
	}

	answerByShortcut(shortcut: string): ChoiceModel | undefined {
		return this.answers.find(
			(answer): answer is ChoiceModel =>
				answer.kind === 'choice' && this.shortcutOf(answer) === shortcut
		);
	}

	register(answer: Answer): void {
		this.#registered = [...this.#registered, answer];
	}

	unregister(answer: Answer): void {
		this.#registered = this.#registered.filter((entry) => entry !== answer);
	}

	/** Adds a Description id to `aria-describedby` until the returned cleanup runs. */
	describe(id: string): () => void {
		untrack(() => (this.descriptions = [...this.descriptions, id]));
		return () => (this.descriptions = this.descriptions.filter((entry) => entry !== id));
	}

	/** Adds an Error id to `aria-describedby` while the item is invalid, until the returned cleanup runs. */
	explain(id: string): () => void {
		untrack(() => (this.errors = [...this.errors, id]));
		return () => (this.errors = this.errors.filter((entry) => entry !== id));
	}

	/** Keeps only the answer a user just chose in a single-answer item. */
	claim(answer: Answer): void {
		if (!this.multiple)
			for (const entry of this.#registered) if (entry !== answer) entry.deselect();
	}

	skip(): void {
		if (this.required) return;
		for (const answer of this.#registered) answer.deselect();
		this.skipped = true;
	}

	reset(): void {
		this.attempted = false;
		this.skipped = false;
		let kept = false;
		for (const answer of this.controls) {
			answer.reset();
			if (this.multiple || !answer.answered) continue;
			if (kept) answer.deselect();
			kept = true;
		}
	}

	validate(): boolean {
		this.attempted = true;
		if (!this.valid) return false;
		if (!this.root.nativeValidation) return true;
		const element = this.answers.find(
			(answer) => answer.answered && answer.element?.willValidate && !answer.element.validity.valid
		)?.element;
		if (!element) return true;
		element.focus();
		element.reportValidity();
		return false;
	}

	focus(): void {
		this.element?.focus();
	}

	focusInvalid(): void {
		const element = this.element;
		const target =
			element?.querySelector<HTMLElement>('input[data-filled][name]:not(:disabled)') ??
			element?.querySelector<HTMLElement>(
				'input:not([type=hidden]):not(:disabled), textarea:not(:disabled)'
			) ??
			element;
		target?.focus();
	}

	moveAnswerFocus(current: Element, direction: 'next' | 'previous'): boolean {
		const answers = this.answers;
		const index = answers.findIndex((answer) => answer.element === current);
		const currentAnswer = answers[index];
		const emptyInput =
			currentAnswer?.kind === 'input' &&
			currentAnswer.element !== undefined &&
			isEmptyNavigableInput(currentAnswer.element);
		if (
			!answers.length ||
			(isTextEntryTarget(current) && !emptyInput) ||
			(index < 0 && current !== this.element)
		)
			return false;
		const next =
			index < 0
				? (answers.find((answer) => answer.answered) ??
					(direction === 'next' ? answers[0] : answers[answers.length - 1]))
				: answers[(index + (direction === 'next' ? 1 : -1) + answers.length) % answers.length];
		const element = next?.element;
		if (!element || element === current) return false;
		// Native radio groups already move between their radios.
		if (index >= 0 && isRadioTarget(current) && isRadioTarget(element)) return false;
		element.focus();
		if (isRadioTarget(element)) element.click();
		return true;
	}

	/** Keeps the first answer when a multiple item becomes single. Runs before the DOM turns checkboxes into radios. */
	syncMultiple(): void {
		const multiple = this.multiple;
		untrack(() => {
			if (this.#wasMultiple && !multiple) {
				const kept = this.answers.find((answer) => answer.answered);
				for (const answer of this.#registered) {
					if (answer === kept) continue;
					answer.deselect();
					// A checked input that turns into a radio unchecks the kept one, and Svelte applies `type` before `checked`.
					if (answer.kind === 'choice' && answer.element) answer.element.checked = false;
				}
			}
			this.#wasMultiple = multiple;
		});
	}

	/** An answer clears a skip, whether a click or a bound value made it. */
	clearSkip(): void {
		// Losing every answer, which Skip itself causes, keeps the skip.
		if (this.#answered) untrack(() => (this.skipped = false));
	}

	reportStatus(): void {
		const status = this.status;
		untrack(() => {
			const previous = this.#reportedStatus;
			this.#reportedStatus = status;
			if (previous !== undefined && previous !== status) this.#options.onStatusChange?.(status);
		});
	}

	attach: Attachment<HTMLFieldSetElement> = (element) => {
		this.element = element;
		return () => {
			this.element = undefined;
		};
	};
}

export interface ChoiceOptions {
	readonly id: string;
	readonly value: string;
	readonly disabled: boolean;
	checked: boolean;
	readonly defaultChecked: boolean | undefined;
	readonly onchange: HTMLInputAttributes['onchange'];
}

export class ChoiceModel {
	readonly kind = 'choice';
	readonly item: ItemModel;
	readonly #options: ChoiceOptions;
	readonly #initial: boolean;
	element = $state.raw<HTMLInputElement>();

	constructor(item: ItemModel, options: ChoiceOptions) {
		this.item = item;
		this.#options = options;
		this.#initial = options.checked;
	}

	get id(): string {
		return this.#options.id;
	}
	get value(): string {
		return this.#options.value;
	}
	get ownDisabled(): boolean {
		return this.#options.disabled;
	}
	get disabled(): boolean {
		return this.item.disabled || this.#options.disabled;
	}
	get checked(): boolean {
		return this.#options.checked;
	}
	set checked(checked: boolean) {
		this.#options.checked = checked;
	}
	get answered(): boolean {
		return this.checked;
	}
	/** What a form reset restores, which like a native `checked` attribute defaults to the initial state. */
	get default(): boolean {
		return this.#options.defaultChecked ?? this.#initial;
	}

	shortcut = $derived.by(() => this.item.shortcutOf(this));
	type = $derived.by((): 'checkbox' | 'radio' => (this.item.multiple ? 'checkbox' : 'radio'));

	deselect(): void {
		this.checked = false;
	}

	reset(): void {
		this.checked = this.default;
	}

	change = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
		chain(this.#select, this.#options.onchange)(event);

	#select = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		this.checked = event.currentTarget.checked;
		if (this.checked) this.item.claim(this);
	};

	attach: Attachment<HTMLInputElement> = (element) => {
		this.element = element;
		return () => {
			this.element = undefined;
		};
	};
}

export interface InputOptions {
	value: string | number | null | undefined;
	readonly defaultValue: string | number | null | undefined;
	readonly disabled: boolean;
}

export class InputModel {
	readonly kind = 'input';
	readonly item: ItemModel;
	readonly #options: InputOptions;
	readonly #initial: string | number | null | undefined;
	element = $state.raw<HTMLInputElement>();
	/**
	 * Whether this input is the item's answer. Every value change selects a filled input, from typing or a bound value.
	 * A single-answer item deselects it, keeping its text as a draft.
	 */
	selected = $derived(hasInputValue(this.value));

	constructor(item: ItemModel, options: InputOptions) {
		this.item = item;
		this.#options = options;
		this.#initial = options.value;
	}

	get value(): string | number | null | undefined {
		return this.#options.value;
	}
	set value(value: string | number | null | undefined) {
		this.#options.value = value;
	}
	get disabled(): boolean {
		return this.item.disabled || this.#options.disabled;
	}
	/** What a form reset restores, which like a native `value` attribute defaults to the initial value. */
	get default(): string | number | null | undefined {
		return this.#options.defaultValue !== undefined ? this.#options.defaultValue : this.#initial;
	}

	filled = $derived(hasInputValue(this.value));
	answered = $derived(this.selected && this.filled);

	deselect(): void {
		this.selected = false;
	}

	reset(): void {
		this.value = this.default;
		this.selected = hasInputValue(this.default);
	}

	input = (element: HTMLInputElement) => {
		this.value =
			element.type === 'number'
				? element.value === ''
					? null
					: element.valueAsNumber
				: element.value;
		this.selected = hasInputValue(element.value);
		if (this.selected) this.item.claim(this);
		else this.item.skipped = false;
	};

	attach: Attachment<HTMLInputElement> = (element) => {
		this.element = element;
		return () => {
			this.element = undefined;
		};
	};
}

export const [getItem, setItem] = createContext<ItemModel>();
export const [getChoice, setChoice] = createContext<ChoiceModel>();
