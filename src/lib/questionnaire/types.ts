// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/types.ts
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

import type { Snippet } from 'svelte';
import type {
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLFieldsetAttributes,
	HTMLFormAttributes,
	HTMLInputAttributes
} from 'svelte/elements';
import type { RenderChildren } from '../internal/render-children.js';

export type QuestionnaireItemStatus = 'unanswered' | 'answered' | 'skipped';
export type QuestionnaireShortcutMode = 'letters' | 'numbers';

export interface QuestionnaireChoiceDefinition {
	value: string;
	disabled?: boolean;
}

export interface QuestionnaireItemDefinition {
	name: string;
	required?: boolean;
	disabled?: boolean;
	choices?: readonly QuestionnaireChoiceDefinition[];
}

export type QuestionnaireInputType =
	| 'date'
	| 'datetime-local'
	| 'email'
	| 'month'
	| 'number'
	| 'password'
	| 'search'
	| 'tel'
	| 'text'
	| 'time'
	| 'url'
	| 'week';

type Render<Props, State> = Snippet<[props: Props, state: State, children: RenderChildren]>;
type NoState = Record<string, never>;

export interface QuestionnaireRootState {
	/** The 1-based position of the active item, or 0 when no item is enabled. */
	current: number;
	/** Whether the first item is active. */
	first: boolean;
	/** Whether the last item is active. */
	last: boolean;
	/** The number of enabled items. */
	total: number;
}

export interface QuestionnaireRootProps extends Omit<
	HTMLFormAttributes,
	'children' | 'novalidate'
> {
	/** The active item name. Bind it to follow and set navigation. */
	item?: string;
	/** The item to start on when `item` is undefined. Defaults to the first enabled item. */
	defaultItem?: string;
	/** Item order, required flags and choice values, so the server renders the active item, progress and shortcuts. */
	items?: readonly QuestionnaireItemDefinition[];
	/** Called when navigation moves to another item. */
	onItemChange?: (item: string) => void;
	/** Gives each choice a letter or number key that selects it. */
	shortcuts?: QuestionnaireShortcutMode;
	/** Turns off the browser's constraint validation UI. Questionnaire validation still runs. @default true */
	novalidate?: boolean;
	children?: Snippet;
}

export type QuestionnaireProgressState = QuestionnaireRootState;

export interface QuestionnaireProgressProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, QuestionnaireProgressState>;
	/** Defaults to "Question {current} of {total}". */
	children?: Snippet;
}

export interface QuestionnaireItemState {
	/** Whether the item is the active one. */
	active: boolean;
	/** Whether the item is disabled. */
	disabled: boolean;
	/** Whether the item failed validation or `invalid` is set. */
	invalid: boolean;
	/** Whether the item takes more than one choice. */
	multiple: boolean;
	/** Whether the item needs an answer. */
	required: boolean;
	/** Whether the item is answered, skipped or neither. */
	status: QuestionnaireItemStatus;
}

export interface QuestionnaireItemProps extends Omit<
	HTMLFieldsetAttributes,
	'children' | 'name' | 'disabled'
> {
	/** Unique within the questionnaire, and the form field name of its answers. */
	name: string;
	/** Whether the item needs an answer. A required item cannot be skipped. @default false */
	required?: boolean;
	/** Renders fixed choices as checkboxes. */
	multiple?: boolean;
	/** Removes the item from progress, navigation, validation and submission. */
	disabled?: boolean;
	/** Marks the item invalid from an external validator. */
	invalid?: boolean;
	/** Called when the item becomes answered, skipped or unanswered. */
	onStatusChange?: (status: QuestionnaireItemStatus) => void;
	children?: Snippet;
}

export interface QuestionnaireTitleProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/** Replaces the `<legend>`. Give it an `id` and pass that to the Item's `aria-labelledby`. */
	render?: Render<HTMLAttributes<HTMLElement>, NoState>;
	children?: Snippet;
}

export interface QuestionnaireDescriptionProps extends Omit<
	HTMLAttributes<HTMLElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, NoState>;
	children?: Snippet;
}

export interface QuestionnaireChoicesState {
	/** The shortcut mode, or null when shortcuts are off. */
	shortcuts: QuestionnaireShortcutMode | null;
}

export interface QuestionnaireChoicesProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, QuestionnaireChoicesState>;
	children?: Snippet;
}

export interface QuestionnaireChoiceState {
	/** Whether the choice is selected. */
	checked: boolean;
	/** Whether the choice or its item is disabled. */
	disabled: boolean;
	/** Whether its item is invalid. */
	invalid: boolean;
	/** The key that selects the choice, or null. */
	shortcut: string | null;
	/** The native control type. A multiple item renders checkboxes. */
	type: 'checkbox' | 'radio';
}

export interface QuestionnaireChoiceProps extends Omit<
	HTMLAttributes<HTMLElement>,
	'children' | 'onchange'
> {
	/** The value the choice submits. */
	value: string;
	/** Bind it to follow and set the selection. */
	checked?: boolean;
	/** The state a form reset restores. Defaults to the initial `checked`. */
	defaultChecked?: boolean;
	/** Whether the choice ignores user interaction. @default false */
	disabled?: boolean;
	/** Runs for the native input's change event. */
	onchange?: HTMLInputAttributes['onchange'];
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, QuestionnaireChoiceState>;
	children?: Snippet;
}

export interface QuestionnaireChoiceInputProps extends Omit<
	HTMLInputAttributes,
	'checked' | 'defaultChecked' | 'disabled' | 'name' | 'required' | 'type' | 'value' | 'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element and the component's state.
	 */
	render?: Snippet<[props: HTMLInputAttributes, state: QuestionnaireChoiceState]>;
}

export interface QuestionnaireChoiceLabelProps extends Omit<
	HTMLAttributes<HTMLElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, NoState>;
	children?: Snippet;
}

export interface QuestionnaireChoiceShortcutState {
	/** The key that selects the choice, or null. */
	shortcut: string | null;
}

export interface QuestionnaireChoiceShortcutProps extends Omit<
	HTMLAttributes<HTMLElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, QuestionnaireChoiceShortcutState>;
	/** Defaults to the assigned shortcut. */
	children?: Snippet;
}

export interface QuestionnaireInputState {
	/** Whether the input or its item is disabled. */
	disabled: boolean;
	/** Whether the input holds text. */
	filled: boolean;
	/** Whether its item is invalid. */
	invalid: boolean;
}

export interface QuestionnaireInputProps extends Omit<
	HTMLInputAttributes,
	'form' | 'name' | 'type' | 'value' | 'defaultValue' | 'disabled' | 'children'
> {
	/** A text-entry input type, such as `email`, `number` or `date`. @default 'text' */
	type?: QuestionnaireInputType;
	/** Bind it to follow and set the text. A number input holds a number, or null when empty. */
	value?: string | number | null;
	/** The value a form reset restores. Defaults to the initial `value`. */
	defaultValue?: string | number | null;
	/** Whether the input ignores user interaction. @default false */
	disabled?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element and the component's state.
	 */
	render?: Snippet<[props: HTMLInputAttributes, state: QuestionnaireInputState]>;
}

export interface QuestionnaireErrorState {
	/** Whether its item is invalid. */
	invalid: boolean;
}

export interface QuestionnaireErrorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLAttributes<HTMLElement>, QuestionnaireErrorState>;
	/** Defaults to a message that depends on whether the item is required. */
	children?: Snippet;
}

export interface QuestionnaireNavigationState {
	/** Whether the button is disabled. */
	disabled: boolean;
	/** `Enter` on an enabled, visible Next or Submit. */
	shortcut: 'Enter' | null;
	/** The active item's status, or null when no item is active. */
	status: QuestionnaireItemStatus | null;
	/** Whether the action applies to the active item. */
	visible: boolean;
}

export interface QuestionnaireNavigationProps extends Omit<HTMLButtonAttributes, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Render<HTMLButtonAttributes, QuestionnaireNavigationState>;
	/** Defaults to the action's name, such as "Next". */
	children?: Snippet;
}

export type QuestionnairePreviousProps = QuestionnaireNavigationProps;
export type QuestionnaireSkipProps = QuestionnaireNavigationProps;
export type QuestionnaireNextProps = QuestionnaireNavigationProps;
export type QuestionnaireSubmitProps = QuestionnaireNavigationProps;
export type QuestionnaireChoiceInputState = QuestionnaireChoiceState;
export type QuestionnairePreviousState = QuestionnaireNavigationState;
export type QuestionnaireSkipState = QuestionnaireNavigationState;
export type QuestionnaireNextState = QuestionnaireNavigationState;
export type QuestionnaireSubmitState = QuestionnaireNavigationState;
