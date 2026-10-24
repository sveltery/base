// Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/index.ts
// (commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.

import QuestionnaireChoice from './QuestionnaireChoice.svelte';
import QuestionnaireChoiceInput from './QuestionnaireChoiceInput.svelte';
import QuestionnaireChoiceLabel from './QuestionnaireChoiceLabel.svelte';
import QuestionnaireChoiceShortcut from './QuestionnaireChoiceShortcut.svelte';
import QuestionnaireChoices from './QuestionnaireChoices.svelte';
import QuestionnaireDescription from './QuestionnaireDescription.svelte';
import QuestionnaireError from './QuestionnaireError.svelte';
import QuestionnaireInput from './QuestionnaireInput.svelte';
import QuestionnaireItem from './QuestionnaireItem.svelte';
import QuestionnaireNext from './QuestionnaireNext.svelte';
import QuestionnairePrevious from './QuestionnairePrevious.svelte';
import QuestionnaireProgress from './QuestionnaireProgress.svelte';
import QuestionnaireRoot from './QuestionnaireRoot.svelte';
import QuestionnaireSkip from './QuestionnaireSkip.svelte';
import QuestionnaireSubmit from './QuestionnaireSubmit.svelte';
import QuestionnaireTitle from './QuestionnaireTitle.svelte';

export const Questionnaire = {
	Root: QuestionnaireRoot,
	Progress: QuestionnaireProgress,
	Item: QuestionnaireItem,
	Title: QuestionnaireTitle,
	Description: QuestionnaireDescription,
	Choices: QuestionnaireChoices,
	Choice: QuestionnaireChoice,
	ChoiceInput: QuestionnaireChoiceInput,
	ChoiceLabel: QuestionnaireChoiceLabel,
	ChoiceShortcut: QuestionnaireChoiceShortcut,
	Input: QuestionnaireInput,
	Error: QuestionnaireError,
	Previous: QuestionnairePrevious,
	Skip: QuestionnaireSkip,
	Next: QuestionnaireNext,
	Submit: QuestionnaireSubmit
};

export type * from './types.js';
export * from './data-attributes.js';
