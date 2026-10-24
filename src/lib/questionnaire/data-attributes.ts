// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

export const QuestionnaireRootDataAttributes = {
	/** The 1-based position of the active item. */
	current: 'data-current',
	/** The number of enabled items. */
	total: 'data-total',
	/** Present when the first item is active. */
	first: 'data-first',
	/** Present when the last item is active. */
	last: 'data-last',
	/** The shortcut mode, `letters` or `numbers`, when shortcuts are on. */
	shortcuts: 'data-shortcuts'
} as const;

export const QuestionnaireProgressDataAttributes = {
	/** The 1-based position of the active item. */
	current: 'data-current',
	/** The number of enabled items. */
	total: 'data-total',
	/** Present when the first item is active. */
	first: 'data-first',
	/** Present when the last item is active. */
	last: 'data-last'
} as const;

export const QuestionnaireItemDataAttributes = {
	/** Present when the item is the active one. */
	active: 'data-active',
	/** The answer status: `unanswered`, `answered` or `skipped`. */
	status: 'data-status',
	/** Present when the item needs an answer. */
	required: 'data-required',
	/** Present when the item takes more than one choice. */
	multiple: 'data-multiple',
	/** Present when the item is disabled. */
	disabled: 'data-disabled',
	/** Present when the item failed validation or `invalid` is set. */
	invalid: 'data-invalid'
} as const;

export const QuestionnaireChoicesDataAttributes = {
	/** The shortcut mode, `letters` or `numbers`, when shortcuts are on. */
	shortcuts: 'data-shortcuts'
} as const;

export const QuestionnaireChoiceDataAttributes = {
	/** The control type: `radio`, or `checkbox` in a multiple item. */
	type: 'data-type',
	/** Present when the choice is selected. */
	checked: 'data-checked',
	/** Present when the choice is not selected. */
	unchecked: 'data-unchecked',
	/** Present when the choice is disabled. */
	disabled: 'data-disabled',
	/** Present when its item is invalid. */
	invalid: 'data-invalid',
	/** The key that selects the choice. */
	shortcut: 'data-shortcut'
} as const;

export const QuestionnaireChoiceInputDataAttributes = {
	/** The control type: `radio`, or `checkbox` in a multiple item. */
	type: 'data-type',
	/** Present when the choice is selected. */
	checked: 'data-checked',
	/** Present when the choice is not selected. */
	unchecked: 'data-unchecked',
	/** Present when the choice is disabled. */
	disabled: 'data-disabled',
	/** Present when its item is invalid. */
	invalid: 'data-invalid',
	/** The key that selects the choice. */
	shortcut: 'data-shortcut'
} as const;

export const QuestionnaireChoiceShortcutDataAttributes = {
	/** The key that selects the choice. */
	shortcut: 'data-shortcut'
} as const;

export const QuestionnaireInputDataAttributes = {
	/** Present when the input holds text. */
	filled: 'data-filled',
	/** Present when the input is empty. */
	empty: 'data-empty',
	/** Present when the input is disabled. */
	disabled: 'data-disabled',
	/** Present when its item is invalid. */
	invalid: 'data-invalid'
} as const;

export const QuestionnaireErrorDataAttributes = {
	/** Present while its item is invalid. */
	invalid: 'data-invalid'
} as const;

export const QuestionnairePreviousDataAttributes = {
	/** Present when the action applies to the active item. */
	visible: 'data-visible',
	/** Present when the action does not apply to the active item. */
	hidden: 'data-hidden',
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/** `Enter` on an enabled, visible Next or Submit. */
	shortcut: 'data-shortcut',
	/** The active item's status: `unanswered`, `answered` or `skipped`. */
	status: 'data-status'
} as const;

export const QuestionnaireSkipDataAttributes = {
	/** Present when the action applies to the active item. */
	visible: 'data-visible',
	/** Present when the action does not apply to the active item. */
	hidden: 'data-hidden',
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/** `Enter` on an enabled, visible Next or Submit. */
	shortcut: 'data-shortcut',
	/** The active item's status: `unanswered`, `answered` or `skipped`. */
	status: 'data-status'
} as const;

export const QuestionnaireNextDataAttributes = {
	/** Present when the action applies to the active item. */
	visible: 'data-visible',
	/** Present when the action does not apply to the active item. */
	hidden: 'data-hidden',
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/** `Enter` on an enabled, visible Next or Submit. */
	shortcut: 'data-shortcut',
	/** The active item's status: `unanswered`, `answered` or `skipped`. */
	status: 'data-status'
} as const;

export const QuestionnaireSubmitDataAttributes = {
	/** Present when the action applies to the active item. */
	visible: 'data-visible',
	/** Present when the action does not apply to the active item. */
	hidden: 'data-hidden',
	/** Present when the button is disabled. */
	disabled: 'data-disabled',
	/** `Enter` on an enabled, visible Next or Submit. */
	shortcut: 'data-shortcut',
	/** The active item's status: `unanswered`, `answered` or `skipped`. */
	status: 'data-status'
} as const;
