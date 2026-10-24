// React @shadcn/react 0.3.1 counterpart of QuestionnaireFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { Questionnaire } from '@shadcn/react/questionnaire';
import { mountApp, passProps } from '../react-fixture.js';
import type { QuestionnaireCase } from './cases.js';

export function mountQuestionnaireReference(
	node: HTMLElement,
	scenario: QuestionnaireCase,
	onReady: () => void
) {
	function App() {
		const [submitted, setSubmitted] = useState('');
		useEffect(onReady, []);

		const choice = (value: string) =>
			h(
				Questionnaire.Choice,
				passProps({ key: value, value, 'data-testid': `size-${value}` }),
				h(
					Questionnaire.ChoiceInput,
					passProps({
						'aria-label': value,
						'data-testid': `size-${value}-input`,
						onChange: (event: { preventDefault(): void }) => {
							if (scenario === 'prevented' && value === 'large') event.preventDefault();
						}
					})
				),
				h(Questionnaire.ChoiceShortcut, passProps({ 'data-testid': `size-${value}-shortcut` })),
				h(Questionnaire.ChoiceLabel, null, value)
			);

		return h(
			Fragment,
			null,
			h(
				Questionnaire.Root,
				passProps({
					'data-testid': 'root',
					shortcuts: scenario === 'shortcuts' ? 'letters' : undefined,
					onSubmit: (event: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
						event.preventDefault();
						setSubmitted(JSON.stringify([...new FormData(event.currentTarget)]));
					}
				}),
				h(Questionnaire.Progress, passProps({ 'data-testid': 'progress' })),
				h(
					Questionnaire.Item,
					passProps({
						name: 'size',
						required: scenario !== 'optional',
						multiple: scenario === 'multiple',
						'data-testid': 'size'
					}),
					h(Questionnaire.Title, null, 'Size'),
					h(
						Questionnaire.Choices,
						passProps({ 'data-testid': 'size-choices' }),
						choice('small'),
						choice('large')
					),
					h(Questionnaire.Error, passProps({ 'data-testid': 'size-error' }))
				),
				h(
					Questionnaire.Item,
					passProps({ name: 'notes', 'data-testid': 'notes' }),
					h(Questionnaire.Title, null, 'Notes'),
					h(
						Questionnaire.Input,
						passProps({
							'aria-label': 'Notes',
							'data-testid': 'notes-input',
							onChange: (event: { preventDefault(): void }) => {
								if (scenario === 'prevented') event.preventDefault();
							}
						})
					),
					h(Questionnaire.Error, passProps({ 'data-testid': 'notes-error' }))
				),
				h(Questionnaire.Previous, passProps({ 'data-testid': 'previous' })),
				h(Questionnaire.Skip, passProps({ 'data-testid': 'skip' })),
				h(Questionnaire.Next, passProps({ 'data-testid': 'next' })),
				h(Questionnaire.Submit, passProps({ 'data-testid': 'submit' })),
				h('button', { type: 'reset' }, 'Reset')
			),
			h('output', { 'data-testid': 'submitted' }, submitted)
		);
	}

	return mountApp(node, App);
}
