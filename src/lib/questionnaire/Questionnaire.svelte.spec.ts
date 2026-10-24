import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import QuestionnaireCollectionHarness from '../../tests/QuestionnaireCollectionHarness.svelte';
import QuestionnaireHarness from '../../tests/QuestionnaireHarness.svelte';

type Fixture = {
	toggle(): void;
	write(text: string): void;
	preventKeydown(): void;
	bound(): { item: string; checked: boolean; text: string };
};
let instance: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (instance) await unmount(instance);
	instance = undefined;
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

function setup(scenario: string, props: Record<string, unknown> = {}) {
	instance = mount(QuestionnaireHarness, { target: document.body, props: { scenario, ...props } });
	flushSync();
	return instance as unknown as Fixture;
}

function el<T extends HTMLElement = HTMLElement>(testId: string) {
	const element = document.querySelector<T>(`[data-testid="${testId}"]`);
	if (!element) throw new Error(`Missing test element: ${testId}`);
	return element;
}
const form = () => el<HTMLFormElement>('root');
const item = (name: string) => el<HTMLFieldSetElement>(name);
const input = (testId: string) => el<HTMLInputElement>(testId);
const choiceInput = (testId: string) => el<HTMLInputElement>(`${testId}-input`);
const button = (testId: string) => el<HTMLButtonElement>(testId);
const values = (name: string) => new FormData(form()).getAll(name);

function act(run: () => void) {
	run();
	flushSync();
}
const click = (element: HTMLElement) => act(() => element.click());
const choose = (testId: string) => click(choiceInput(testId));
function type(element: HTMLInputElement, value: string) {
	act(() => {
		element.focus();
		element.value = value;
		element.dispatchEvent(new Event('input', { bubbles: true }));
	});
}
function keydown(element: HTMLElement, key: string, options: KeyboardEventInit = {}) {
	act(() => {
		element.focus();
		element.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, ...options })
		);
	});
}
const submitEvent = () =>
	act(() => form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
const submitSpy = () => vi.fn((event: SubmitEvent) => event.preventDefault());

describe('Questionnaire', () => {
	it('owns its ordered items, progress, and navigation', () => {
		setup('main');
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(form().dataset.current).toBe('1');
		expect(form().dataset.total).toBe('2');
		expect(form().hasAttribute('data-first')).toBe(true);
		expect(form().noValidate).toBe(true);
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		expect(item('detail').hidden).toBe(true);
		expect(item('detail').hasAttribute('inert')).toBe(true);
		expect(input('scope-input').id).not.toBe('');
		expect(input('scope-input').hasAttribute('name')).toBe(false);
		expect(button('previous').hasAttribute('data-hidden')).toBe(true);
		expect(button('previous').getAttribute('aria-hidden')).toBe('true');
		expect(button('next').hasAttribute('data-visible')).toBe(true);
		expect(button('next').textContent).toBe('Next');
		expect(button('next').type).toBe('button');
		expect(button('next').dataset.status).toBe('unanswered');
		expect(button('submit').hasAttribute('data-hidden')).toBe(true);
		expect(button('submit').type).toBe('submit');

		click(button('next'));
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		expect(item('scope').getAttribute('aria-invalid')).toBe('true');
		expect(item('scope').hasAttribute('data-invalid')).toBe(true);
		expect(el('scope-error').hidden).toBe(false);
		expect(el('scope-error').textContent).toBe('Choose an answer to continue.');
		expect(document.activeElement).toBe(choiceInput('scope-delegation'));

		choose('scope-delegation');
		expect(item('scope').hasAttribute('aria-invalid')).toBe(false);
		expect(button('next').dataset.status).toBe('answered');
		click(button('next'));

		expect(el('progress').textContent).toBe('Question 2 of 2');
		expect(form().hasAttribute('data-last')).toBe(true);
		expect(item('scope').hidden).toBe(true);
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(item('detail'));
		expect(button('previous').hasAttribute('data-visible')).toBe(true);
		expect(button('next').hasAttribute('data-hidden')).toBe(true);
		expect(button('submit').hasAttribute('data-visible')).toBe(true);
		expect(button('submit').dataset.status).toBe('unanswered');

		click(button('submit'));
		expect(item('detail').getAttribute('aria-invalid')).toBe('true');
		expect(el('detail-error').hidden).toBe(false);
		expect(document.activeElement).toBe(choiceInput('detail-focused'));

		choose('detail-focused');
		expect(item('detail').hasAttribute('aria-invalid')).toBe(false);
		expect(button('submit').dataset.status).toBe('answered');
		click(button('previous'));
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		expect(choiceInput('scope-delegation').checked).toBe(true);
	});

	it('moves between items with horizontal arrows outside radios and text entry', () => {
		setup('main');
		expect(item('scope').getAttribute('aria-keyshortcuts')).toBe(
			'Meta+Enter Control+Enter ArrowUp ArrowDown'
		);
		keydown(item('scope'), 'ArrowRight');
		expect(item('scope').hasAttribute('data-active')).toBe(true);

		choose('scope-delegation');
		expect(item('scope').getAttribute('aria-keyshortcuts')).toBe(
			'Meta+Enter Control+Enter ArrowUp ArrowDown ArrowRight'
		);
		keydown(choiceInput('scope-delegation'), 'ArrowRight');
		keydown(item('scope'), 'ArrowRight', { ctrlKey: true });
		keydown(item('scope'), 'ArrowRight', { repeat: true });
		expect(item('scope').hasAttribute('data-active')).toBe(true);

		keydown(item('scope'), 'ArrowRight');
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		expect(item('detail').getAttribute('aria-keyshortcuts')).toBe(
			'Meta+Enter Control+Enter ArrowUp ArrowDown ArrowLeft'
		);
		expect(document.activeElement).toBe(item('detail'));

		keydown(item('detail'), 'ArrowLeft');
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(item('scope'));

		type(input('scope-input'), 'A custom answer');
		keydown(input('scope-input'), 'ArrowRight');
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		keydown(button('next'), 'ArrowRight');
		expect(item('detail').hasAttribute('data-active')).toBe(true);
	});

	it('moves vertical focus across fixed and freeform answers', () => {
		setup('main');
		choose('scope-questions');
		keydown(choiceInput('scope-questions'), 'ArrowDown');
		expect(document.activeElement).toBe(input('scope-input'));
		expect(choiceInput('scope-questions').checked).toBe(true);

		keydown(input('scope-input'), 'ArrowUp');
		expect(document.activeElement).toBe(choiceInput('scope-questions'));
		expect(choiceInput('scope-questions').checked).toBe(true);

		keydown(choiceInput('scope-questions'), 'ArrowDown');
		keydown(input('scope-input'), 'ArrowDown');
		expect(document.activeElement).toBe(choiceInput('scope-delegation'));
		expect(choiceInput('scope-delegation').checked).toBe(true);

		type(input('scope-input'), 'A custom answer');
		keydown(input('scope-input'), 'ArrowUp');
		expect(document.activeElement).toBe(input('scope-input'));
		keydown(input('scope-input'), 'ArrowDown');
		expect(document.activeElement).toBe(input('scope-input'));

		keydown(item('scope'), 'ArrowRight');
		keydown(item('detail'), 'ArrowDown');
		expect(document.activeElement).toBe(choiceInput('detail-focused'));
		expect(choiceInput('detail-focused').checked).toBe(true);

		keydown(item('detail'), 'ArrowLeft');
		keydown(item('scope'), 'ArrowDown');
		expect(document.activeElement).toBe(input('scope-input'));
		expect(input('scope-input').value).toBe('A custom answer');
	});

	it('moves vertical focus through multiple choices without toggling', () => {
		setup('multiple-focus');
		keydown(item('multiple'), 'ArrowDown');
		expect(document.activeElement).toBe(choiceInput('first'));
		expect(choiceInput('first').checked).toBe(false);
		keydown(choiceInput('first'), 'ArrowDown');
		expect(document.activeElement).toBe(choiceInput('second'));
		expect(choiceInput('second').checked).toBe(false);
		keydown(item('multiple'), 'ArrowUp');
		expect(document.activeElement).toBe(choiceInput('second'));
		expect(choiceInput('second').checked).toBe(false);
	});

	it.each(['email', 'password', 'search', 'tel', 'text', 'url'])(
		'moves vertically out of an empty %s input',
		(type) => {
			setup('input-type', { type });
			keydown(input('answer-input'), 'ArrowUp');
			expect(document.activeElement).toBe(choiceInput('fixed'));
			expect(choiceInput('fixed').checked).toBe(true);
		}
	);

	it.each(['date', 'datetime-local', 'month', 'number', 'time', 'week'])(
		'keeps vertical arrows native for an empty %s input',
		(type) => {
			setup('input-type', { type });
			keydown(input('answer-input'), 'ArrowUp');
			expect(document.activeElement).toBe(input('answer-input'));
			keydown(input('answer-input'), 'ArrowDown');
			expect(document.activeElement).toBe(input('answer-input'));
		}
	);

	it('omits disabled answers from shortcuts, navigation, and validation focus', () => {
		setup('disabled-answer');
		expect(el('automatic').hasAttribute('data-shortcut')).toBe(false);
		expect(el('automatic').hasAttribute('data-disabled')).toBe(true);
		expect(el('review').dataset.shortcut).toBe('A');
		expect(input('approval-input').hasAttribute('data-shortcut')).toBe(false);

		keydown(item('approval'), 'ArrowDown');
		expect(document.activeElement).toBe(choiceInput('review'));
		expect(choiceInput('review').checked).toBe(true);

		act(() => form().reset());
		expect(choiceInput('review').checked).toBe(false);
		submitEvent();
		expect(el('approval-error').hidden).toBe(false);
		expect(document.activeElement).toBe(choiceInput('review'));
	});

	it('counts only enabled answers in item status and validation', () => {
		const onStatusChange = vi.fn();
		const fixture = setup('availability', { onStatusChange });
		expect(item('answers').dataset.status).toBe('answered');
		expect(values('answers')).toEqual(['fixed', 'Custom']);

		act(() => fixture.toggle());
		expect(choiceInput('fixed-answer').checked).toBe(true);
		expect(input('custom-answer').value).toBe('Custom');
		expect(item('answers').dataset.status).toBe('unanswered');
		expect(values('answers')).toEqual([]);
		expect(button('submit').disabled).toBe(false);
		expect(onStatusChange).toHaveBeenLastCalledWith('unanswered');

		submitEvent();
		expect(el('answers-error').hidden).toBe(false);
		expect(document.activeElement).toBe(item('answers'));

		act(() => fixture.toggle());
		expect(item('answers').dataset.status).toBe('answered');
		expect(values('answers')).toEqual(['fixed', 'Custom']);
		expect(el('answers-error').hidden).toBe(true);
		expect(onStatusChange.mock.calls).toEqual([['unanswered'], ['answered']]);
	});

	it('returns to and blocks an externally invalid item', () => {
		setup('external');
		choose('first-choice');
		click(button('next'));
		choose('second-choice');
		click(button('submit'));

		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(item('first').dataset.status).toBe('answered');
		expect(item('first').getAttribute('aria-invalid')).toBe('true');
		expect(item('first').getAttribute('aria-describedby')).toBe('first-error');
		expect(choiceInput('first-choice').getAttribute('aria-invalid')).toBe('true');
		expect(el('first-error').hidden).toBe(false);
		expect(el('first-error').getAttribute('role')).toBe('alert');
		expect(document.activeElement).toBe(item('first'));

		keydown(item('first'), 'Enter', { metaKey: true });
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(choiceInput('first-choice'));

		item('first').focus();
		click(button('next'));
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(choiceInput('first-choice'));

		choose('first-alternative');
		expect(item('first').hasAttribute('aria-invalid')).toBe(false);
		expect(el('first-error').hidden).toBe(true);
		click(button('next'));
		expect(item('second').hasAttribute('data-active')).toBe(true);
	});

	it('does not treat ArrowRight as an implicit skip', () => {
		const onStatusChange = vi.fn();
		setup('arrow-skip', { onStatusChange });
		keydown(item('optional'), 'ArrowRight');
		expect(item('optional').hasAttribute('data-active')).toBe(true);
		expect(item('optional').dataset.status).toBe('unanswered');
		expect(onStatusChange).not.toHaveBeenCalled();

		click(button('skip'));
		expect(item('next').hasAttribute('data-active')).toBe(true);
		click(button('previous'));
		expect(item('optional').dataset.status).toBe('skipped');
		expect(onStatusChange.mock.calls).toEqual([['skipped']]);
		expect(item('optional').getAttribute('aria-keyshortcuts')).toBe(
			'Meta+Enter Control+Enter ArrowUp ArrowDown ArrowRight'
		);
		keydown(item('optional'), 'ArrowRight');
		expect(item('next').hasAttribute('data-active')).toBe(true);
	});

	it('activates the first enabled item without reporting initialization as navigation', () => {
		const onItemChange = vi.fn();
		setup('first-enabled', { onItemChange });
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(item('disabled').hidden).toBe(true);
		expect(item('disabled').disabled).toBe(true);
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(el('progress').getAttribute('aria-label')).toBe('Questionnaire progress');
		expect(el('progress').getAttribute('aria-valuenow')).toBe('1');
		expect(el('progress').getAttribute('aria-valuemax')).toBe('2');
		expect(onItemChange).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(document.body);
	});

	it('reports item names and names the answers, not the fieldset', () => {
		const onItemChange = vi.fn();
		setup('main', { onItemChange });
		choose('scope-delegation');
		expect(item('scope').hasAttribute('name')).toBe(false);
		expect(choiceInput('scope-delegation').name).toBe('scope');
		click(button('next'));
		click(button('previous'));
		expect(onItemChange.mock.calls).toEqual([['detail'], ['scope']]);
	});

	it('follows and sets bind:item', () => {
		const onItemChange = vi.fn();
		const fixture = setup('controlled', { onItemChange });
		choose('first-choice');
		click(button('next'));
		expect(item('second').hasAttribute('data-active')).toBe(true);
		expect(fixture.bound().item).toBe('second');
		expect(onItemChange).toHaveBeenLastCalledWith('second');
		click(button('previous'));
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(fixture.bound().item).toBe('first');
		expect(onItemChange.mock.calls).toEqual([['second'], ['first']]);
	});

	it('treats Input as a freeform answer without selecting it on focus', () => {
		setup('main');
		const freeform = input('scope-input');
		act(() => freeform.focus());
		expect(item('scope').dataset.status).toBe('unanswered');
		expect(freeform.hasAttribute('name')).toBe(false);
		expect(freeform.getAttribute('form')).toBe('');
		expect(freeform.hasAttribute('data-empty')).toBe(true);

		type(freeform, 'A different direction');
		expect(item('scope').dataset.status).toBe('answered');
		expect(freeform.name).toBe('scope');
		expect(freeform.hasAttribute('form')).toBe(false);
		expect(freeform.hasAttribute('data-filled')).toBe(true);
		expect(el('scope-delegation').hasAttribute('data-unchecked')).toBe(true);

		choose('scope-questions');
		expect(freeform.value).toBe('A different direction');
		expect(freeform.hasAttribute('name')).toBe(false);
		expect(freeform.hasAttribute('data-filled')).toBe(true);
		expect(el('scope-questions').hasAttribute('data-checked')).toBe(true);

		type(freeform, 'A revised direction');
		expect(freeform.name).toBe('scope');
		expect(choiceInput('scope-questions').checked).toBe(false);
		expect(new FormData(form()).get('scope')).toBe('A revised direction');
	});

	it('follows bind:checked and bind:value in a multiple item', () => {
		const fixture = setup('bound-answers');
		expect(item('answers').dataset.status).toBe('unanswered');
		choose('bound-choice');
		expect(values('answers')).toEqual(['fixed']);
		expect(fixture.bound().checked).toBe(true);
		type(input('bound-input'), 'Custom');
		expect(values('answers')).toEqual(['fixed', 'Custom']);
		expect(fixture.bound().text).toBe('Custom');
		choose('bound-choice');
		type(input('bound-input'), '');
		expect(item('answers').dataset.status).toBe('unanswered');
		expect(values('answers')).toEqual([]);
		expect(fixture.bound()).toEqual({ item: 'first', checked: false, text: '' });
	});

	it('keeps a bound Choice and Input mutually exclusive in a single item', () => {
		const fixture = setup('bound-single');
		choose('bound-choice');
		expect(el('bound-choice').hasAttribute('data-checked')).toBe(true);
		expect(choiceInput('bound-choice').name).toBe('answer');
		expect(input('bound-input').hasAttribute('name')).toBe(false);
		expect(values('answer')).toEqual(['fixed']);

		type(input('bound-input'), 'Custom');
		expect(item('answer').dataset.status).toBe('answered');
		expect(el('bound-choice').hasAttribute('data-unchecked')).toBe(true);
		expect(choiceInput('bound-choice').checked).toBe(false);
		expect(fixture.bound().checked).toBe(false);
		expect(values('answer')).toEqual(['Custom']);

		choose('bound-choice');
		expect(choiceInput('bound-choice').checked).toBe(true);
		expect(input('bound-input').value).toBe('Custom');
		expect(input('bound-input').hasAttribute('name')).toBe(false);
		expect(values('answer')).toEqual(['fixed']);
		expect(fixture.bound()).toEqual({ item: 'first', checked: true, text: 'Custom' });
	});

	it('clears a checked choice and its name when the item is skipped', () => {
		const onStatusChange = vi.fn();
		let submitted: FormDataEntryValue[] | undefined;
		const onsubmit = vi.fn((event: SubmitEvent) => {
			event.preventDefault();
			submitted = new FormData(event.currentTarget as HTMLFormElement).getAll('answer');
		});
		setup('skip-checked', { onStatusChange, onsubmit });
		expect(choiceInput('checked-answer').checked).toBe(true);
		expect(item('answer').dataset.status).toBe('answered');

		click(button('skip'));
		expect(choiceInput('checked-answer').checked).toBe(false);
		expect(choiceInput('checked-answer').hasAttribute('name')).toBe(false);
		expect(item('answer').dataset.status).toBe('skipped');
		expect(values('answer')).toEqual([]);
		expect(onStatusChange.mock.calls).toEqual([['skipped']]);
		expect(onsubmit).toHaveBeenCalledOnce();
		expect(submitted).toEqual([]);
	});

	it('answers a skipped item when its bound choice is checked from outside', () => {
		const onsubmit = submitSpy();
		const fixture = setup('skip-bound', { onsubmit });
		act(() => fixture.toggle());
		expect(item('answer').dataset.status).toBe('answered');
		click(button('skip'));
		expect(item('answer').dataset.status).toBe('skipped');
		expect(choiceInput('bound-answer').checked).toBe(false);
		act(() => fixture.toggle());
		expect(choiceInput('bound-answer').checked).toBe(true);
		expect(item('answer').dataset.status).toBe('answered');
		expect(values('answer')).toEqual(['bound']);

		act(() => fixture.toggle());
		expect(choiceInput('bound-answer').checked).toBe(false);
		expect(item('answer').dataset.status).toBe('unanswered');
		click(button('previous'));
		click(button('next'));
		expect(item('answer').hasAttribute('data-active')).toBe(true);
		expect(item('answer').getAttribute('aria-invalid')).toBe('true');
		click(button('submit'));
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('answers a skipped item when its bound input is filled from outside', () => {
		const fixture = setup('skip-bound');
		click(button('skip'));
		expect(item('answer').dataset.status).toBe('skipped');
		act(() => fixture.write('Custom'));
		expect(item('answer').dataset.status).toBe('answered');
		expect(values('answer')).toEqual(['Custom']);

		act(() => fixture.write(''));
		expect(item('answer').dataset.status).toBe('unanswered');
		expect(values('answer')).toEqual([]);
	});

	it('returns a submit from a later item to the first invalid one and focuses its control', () => {
		const onsubmit = submitSpy();
		setup('submit-earlier', { onsubmit });
		choose('second-choice');
		expect(item('first').hidden).toBe(true);
		click(button('submit'));
		expect(onsubmit).not.toHaveBeenCalled();
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(item('first').hidden).toBe(false);
		expect(item('second').hidden).toBe(true);
		expect(document.activeElement).toBe(choiceInput('first-choice'));
	});

	it('does not require fixed radios when an Input can answer the item', () => {
		setup('native-input');
		expect(form().noValidate).toBe(false);
		expect(choiceInput('fixed').required).toBe(false);
		type(input('answer-input'), 'Freeform');
		expect(form().checkValidity()).toBe(true);
		expect(new FormData(form()).get('answer')).toBe('Freeform');
	});

	it('allows fixed and freeform answers in a multiple item', () => {
		const onsubmit = submitSpy();
		setup('signals', { onsubmit });
		expect(choiceInput('progress').type).toBe('checkbox');
		expect(el('progress').dataset.type).toBe('checkbox');
		expect(item('signals').hasAttribute('data-multiple')).toBe(true);
		choose('progress');
		choose('risks');
		type(input('signals-input'), 'Decisions');
		expect(values('signals')).toEqual(['progress', 'risks', 'Decisions']);
		click(button('submit'));
		expect(onsubmit).toHaveBeenCalledOnce();
		choose('progress');
		expect(values('signals')).toEqual(['risks', 'Decisions']);
	});

	it('keeps the first selection when multiple turns off', () => {
		const fixture = setup('dynamic-multiple');
		choose('first-signal');
		choose('second-signal');
		expect(values('signals')).toEqual(['first', 'second']);

		act(() => fixture.toggle());
		expect(choiceInput('first-signal').type).toBe('radio');
		expect(choiceInput('first-signal').checked).toBe(true);
		expect(choiceInput('second-signal').checked).toBe(false);
		expect(values('signals')).toEqual(['first']);
		expect(item('signals').dataset.status).toBe('answered');

		act(() => fixture.toggle());
		expect(choiceInput('first-signal').type).toBe('checkbox');
		expect(choiceInput('first-signal').checked).toBe(true);
		expect(choiceInput('second-signal').checked).toBe(false);
	});

	it('records an intentional skip separately from an unanswered item', () => {
		const onStatusChange = vi.fn();
		setup('skip-record', { onStatusChange });
		expect(button('skip').hidden).toBe(true);
		choose('plan-choice');
		click(button('next'));
		expect(item('timing').dataset.status).toBe('unanswered');
		expect(button('skip').hidden).toBe(false);
		expect(button('skip').textContent).toBe('Skip');

		choose('timing-choice');
		expect(item('timing').dataset.status).toBe('answered');
		click(button('skip'));
		expect(item('owner').hasAttribute('data-active')).toBe(true);
		expect(choiceInput('timing-choice').checked).toBe(false);
		expect(onStatusChange.mock.calls).toEqual([['answered'], ['skipped']]);

		click(button('previous'));
		expect(item('timing').dataset.status).toBe('skipped');
		choose('timing-choice');
		expect(item('timing').dataset.status).toBe('answered');
		expect(onStatusChange.mock.calls).toEqual([['answered'], ['skipped'], ['answered']]);
	});

	it('treats an intentional skip as valid for an optional external error', () => {
		setup('optional-invalid');
		expect(item('optional').getAttribute('aria-invalid')).toBe('true');
		click(button('skip'));
		expect(item('required').hasAttribute('data-active')).toBe(true);
		click(button('previous'));
		expect(item('optional').dataset.status).toBe('skipped');
		expect(item('optional').hasAttribute('aria-invalid')).toBe(false);
		expect(el('optional-error').hidden).toBe(true);

		choose('optional-choice');
		expect(item('optional').dataset.status).toBe('answered');
		expect(item('optional').getAttribute('aria-invalid')).toBe('true');
		click(button('next'));
		expect(item('optional').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(choiceInput('optional-choice'));
	});

	it('submits after skipping the final optional item', () => {
		const onStatusChange = vi.fn();
		const onsubmit = submitSpy();
		setup('final-skip', { onStatusChange, onsubmit });
		expect(button('skip').hidden).toBe(false);
		expect(el('timing-error').textContent).toBe('Choose an answer or skip this question.');
		click(button('skip'));
		expect(item('timing').dataset.status).toBe('skipped');
		expect(onStatusChange.mock.calls).toEqual([['skipped']]);
		expect(onsubmit).toHaveBeenCalledOnce();
	});

	it('validates unanswered items on native form submission', () => {
		const onsubmit = vi.fn();
		setup('main', { onsubmit });
		expect(item('scope').getAttribute('aria-describedby')).toBe('scope-description');
		submitEvent();
		expect(onsubmit).not.toHaveBeenCalled();
		expect(item('scope').getAttribute('aria-invalid')).toBe('true');
		expect(item('scope').getAttribute('aria-describedby')).toBe(
			'scope-description scope-error-message'
		);
		expect(el('scope-error').hidden).toBe(false);
		expect(document.activeElement).toBe(choiceInput('scope-delegation'));
	});

	it('prevents an invalid submit and passes a valid one to onsubmit', () => {
		const onsubmit = vi.fn((event: SubmitEvent) => event.defaultPrevented);
		setup('main', { onsubmit });
		const invalid = new Event('submit', { bubbles: true, cancelable: true });
		act(() => form().dispatchEvent(invalid));
		expect(invalid.defaultPrevented).toBe(true);
		expect(onsubmit.mock.results).toEqual([]);

		choose('scope-delegation');
		click(button('next'));
		choose('detail-focused');
		const valid = new Event('submit', { bubbles: true, cancelable: true });
		act(() => form().dispatchEvent(valid));
		expect(valid.defaultPrevented).toBe(false);
		expect(onsubmit.mock.results).toEqual([{ type: 'return', value: false }]);
	});

	it('renders each item as a fieldset holding only its answer controls', () => {
		setup('main');
		const controls = (name: string) =>
			Array.from(item(name).elements, (control) => (control as HTMLInputElement).type);
		expect(controls('scope')).toEqual(['radio', 'radio', 'text']);
		expect(controls('detail')).toEqual(['radio', 'radio']);
	});

	it('keeps validation active until an attempted item remains valid', () => {
		setup('attempted');
		submitEvent();
		expect(el('answer-error').hidden).toBe(false);
		type(input('answer-input'), ' ');
		expect(el('answer-error').hidden).toBe(false);
		choose('fixed');
		expect(el('answer-error').hidden).toBe(true);
		choose('fixed');
		expect(el('answer-error').hidden).toBe(false);
		type(input('answer-input'), 'Valid');
		expect(el('answer-error').hidden).toBe(true);
		type(input('answer-input'), '');
		expect(el('answer-error').hidden).toBe(false);
	});

	it('keeps live answers when default props change and uses new defaults on reset', () => {
		const fixture = setup('changing-defaults');
		type(input('default-input'), 'Edited');
		choose('secondary-choice');
		act(() => fixture.toggle());
		expect(input('default-input').value).toBe('Edited');
		expect(choiceInput('secondary-choice').checked).toBe(true);
		expect(item('defaults').dataset.status).toBe('answered');

		act(() => form().reset());
		expect(input('default-input').value).toBe('');
		expect(choiceInput('primary-choice').checked).toBe(true);
		expect(choiceInput('secondary-choice').checked).toBe(false);
		expect(item('defaults').dataset.status).toBe('answered');
	});

	it('keeps Enter metadata on only the selected freeform answer', () => {
		setup('enter-meta');
		type(input('answer-input'), 'Draft');
		expect(input('answer-input').getAttribute('aria-keyshortcuts')).toBe('Enter');
		choose('fixed');
		expect(choiceInput('fixed').getAttribute('aria-keyshortcuts')).toBe('A Enter');
		expect(input('answer-input').value).toBe('Draft');
		expect(input('answer-input').hasAttribute('aria-keyshortcuts')).toBe(false);
	});

	it('registers every Description and Error while they remain mounted', () => {
		const fixture = setup('descriptions');
		expect(item('answer').getAttribute('aria-describedby')).toBe('description-one description-two');
		submitEvent();
		expect(item('answer').getAttribute('aria-describedby')).toBe(
			'description-one description-two error-one error-two'
		);
		act(() => fixture.toggle());
		expect(item('answer').getAttribute('aria-describedby')).toBe('description-one error-one');
	});

	it('resets answers, skips, validation, and the initial item', () => {
		setup('reset');
		choose('chat');
		click(button('skip'));
		choose('detail-choice');
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		expect(choiceInput('email').checked).toBe(false);
		expect(choiceInput('chat').checked).toBe(false);

		act(() => form().reset());
		expect(item('channels').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(item('channels'));
		expect(item('channels').dataset.status).toBe('answered');
		expect(choiceInput('email').checked).toBe(true);
		expect(choiceInput('chat').checked).toBe(false);
		expect(choiceInput('detail-choice').checked).toBe(false);
		expect(item('detail').dataset.status).toBe('unanswered');
	});

	it('skips disabled items', () => {
		setup('disabled-item');
		expect(el('progress').textContent).toBe('Question 1 of 2');
		choose('first-choice');
		click(button('next'));
		expect(item('last').hasAttribute('data-active')).toBe(true);
		expect(item('disabled').hidden).toBe(true);
		expect(el('progress').textContent).toBe('Question 2 of 2');
	});

	it('reconciles inserted and removed items in DOM order', () => {
		const onItemChange = vi.fn();
		const fixture = setup('dynamic-items', { onItemChange });
		expect(el('progress').textContent).toBe('Question 1 of 2');
		act(() => fixture.toggle());
		expect(el('progress').textContent).toBe('Question 1 of 3');
		choose('first-choice');
		click(button('next'));
		expect(item('middle').hasAttribute('data-active')).toBe(true);

		act(() => fixture.toggle());
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(onItemChange.mock.calls).toEqual([['middle'], ['first']]);
	});

	it('reconciles inserted and removed answers in DOM order', () => {
		const fixture = setup('dynamic-answers');
		expect(el('first-answer').dataset.shortcut).toBe('A');
		expect(el('last-answer').dataset.shortcut).toBe('B');
		act(() => fixture.toggle());
		expect(el('first-answer').dataset.shortcut).toBe('A');
		expect(el('middle-answer').dataset.shortcut).toBe('B');
		expect(el('last-answer').dataset.shortcut).toBe('C');
		act(() => fixture.toggle());
		expect(document.querySelector('[data-testid="middle-answer"]')).toBeNull();
		expect(el('last-answer').dataset.shortcut).toBe('B');
	});

	it('follows a keyed reorder of items and answers', async () => {
		const fixture = setup('keyed-order');
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(el('first-a').dataset.shortcut).toBe('A');
		act(() => fixture.toggle());
		await vi.waitFor(() => expect(el('progress').textContent).toBe('Question 2 of 2'));
		expect(el('first-b').dataset.shortcut).toBe('A');
		expect(el('first-a').dataset.shortcut).toBe('B');
	});

	it.each([
		{ count: 27, lastShortcut: 'Z', shortcuts: 'letters' },
		{ count: 10, lastShortcut: '9', shortcuts: 'numbers' }
	])(
		'leaves answers beyond the $shortcuts shortcut range unassigned',
		({ count, lastShortcut, shortcuts }) => {
			setup('overflow', { count, shortcuts });
			expect(el(`answer-${count - 2}`).dataset.shortcut).toBe(lastShortcut);
			expect(el(`answer-${count - 1}`).hasAttribute('data-shortcut')).toBe(false);
			expect(el(`answer-${count - 1}-shortcut`).hidden).toBe(true);
		}
	);

	it('assigns letter shortcuts to enabled answers in DOM order', () => {
		const onsubmit = submitSpy();
		setup('letters', { onsubmit });
		expect(form().dataset.shortcuts).toBe('letters');
		expect(el('choices').dataset.shortcuts).toBe('letters');
		expect(el('disabled-answer').hasAttribute('data-shortcut')).toBe(false);
		expect(el('first-answer').dataset.shortcut).toBe('A');
		expect(el('second-answer').dataset.shortcut).toBe('B');
		expect(el('second-answer-shortcut').textContent).toBe('B');
		expect(input('other-answer').hasAttribute('data-shortcut')).toBe(false);
		expect(choiceInput('first-answer').getAttribute('aria-keyshortcuts')).toBe('A');

		keydown(choiceInput('first-answer'), 'b');
		expect(choiceInput('second-answer').checked).toBe(true);
		expect(document.activeElement).toBe(choiceInput('second-answer'));
		expect(choiceInput('second-answer').getAttribute('aria-keyshortcuts')).toBe('B Enter');
		expect(button('submit').dataset.shortcut).toBe('Enter');
		expect(button('submit').getAttribute('aria-keyshortcuts')).toBe('Enter');

		keydown(choiceInput('second-answer'), 'c');
		expect(document.activeElement).toBe(choiceInput('second-answer'));
		expect(choiceInput('second-answer').checked).toBe(true);

		keydown(input('other-answer'), 'a');
		expect(choiceInput('first-answer').checked).toBe(false);
		expect(document.activeElement).toBe(input('other-answer'));

		type(input('other-answer'), 'Draft answer');
		choose('first-answer');
		keydown(input('other-answer'), 'Enter');
		expect(onsubmit).not.toHaveBeenCalled();
		expect(new FormData(form()).get('answers')).toBe('first');
	});

	it('supports number shortcuts and confirms only from a filled answer', () => {
		const onsubmit = submitSpy();
		setup('numbers', { onsubmit });
		expect(el('first-choice').dataset.shortcut).toBe('1');
		keydown(choiceInput('first-choice'), '1');
		expect(choiceInput('first-choice').checked).toBe(true);
		expect(button('next').dataset.shortcut).toBe('Enter');

		keydown(choiceInput('first-choice'), 'Enter');
		expect(item('second').hasAttribute('data-active')).toBe(true);
		keydown(input('second-input'), 'Enter');
		expect(onsubmit).not.toHaveBeenCalled();
		type(input('second-input'), 'Enough detail');
		keydown(input('second-input'), 'Enter');
		expect(onsubmit).toHaveBeenCalledOnce();
		expect(new FormData(form()).get('second')).toBe('Enough detail');
	});

	it('validates, advances, and submits with Command or Control plus Enter', () => {
		const onsubmit = submitSpy();
		setup('main', { onsubmit });
		keydown(input('scope-input'), 'Enter', { metaKey: true });
		expect(item('scope').hasAttribute('data-active')).toBe(true);
		expect(item('scope').getAttribute('aria-invalid')).toBe('true');
		expect(document.activeElement).toBe(choiceInput('scope-delegation'));

		choose('scope-questions');
		keydown(input('scope-input'), 'Enter', { metaKey: true });
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		choose('detail-focused');
		keydown(item('detail'), 'Enter', { ctrlKey: true });
		expect(onsubmit).toHaveBeenCalledOnce();
	});

	it('does not handle modified, repeated, prevented, or composing keys', () => {
		const onsubmit = submitSpy();
		const fixture = setup('guards', { onsubmit });
		keydown(choiceInput('answer-choice'), 'a', { ctrlKey: true });
		keydown(choiceInput('answer-choice'), 'a', { repeat: true });
		expect(choiceInput('answer-choice').checked).toBe(false);
		keydown(choiceInput('answer-choice'), 'a');
		expect(choiceInput('answer-choice').checked).toBe(true);

		type(input('answer-input'), 'Composing');
		keydown(input('answer-input'), 'Enter', { isComposing: true });
		keydown(input('answer-input'), 'Enter', { metaKey: true, repeat: true });
		keydown(input('answer-input'), 'Enter', { metaKey: true, shiftKey: true });
		expect(onsubmit).not.toHaveBeenCalled();

		act(() => fixture.preventKeydown());
		keydown(input('answer-input'), 'Enter');
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('composes fixed choice inputs, labels, and assigned shortcuts', () => {
		setup('composed');
		const choiceInputEl = input('fixed-input');
		expect(el('fixed').tagName).toBe('LABEL');
		expect(el('fixed').dataset.type).toBe('radio');
		expect(choiceInputEl.type).toBe('radio');
		expect(choiceInputEl.name).toBe('answer');
		expect(choiceInputEl.value).toBe('fixed');
		expect(el('fixed-label').tagName).toBe('SPAN');
		expect(el('fixed-label').textContent).toBe('Fixed');
		expect(el('fixed-shortcut').textContent).toBe('A');
		expect(el('fixed-shortcut').dataset.shortcut).toBe('A');
		expect(el('fixed-shortcut').getAttribute('aria-hidden')).toBe('true');
		expect(el('fixed-shortcut').hidden).toBe(false);
	});

	it('registers a ChoiceInput whenever its composed input mounts', () => {
		const fixture = setup('conditional-input');
		expect(item('answer').dataset.status).toBe('unanswered');
		expect(el('conditional-choice').hasAttribute('data-shortcut')).toBe(false);
		act(() => fixture.toggle());
		const first = input('conditional-input');
		expect(el('conditional-choice').dataset.shortcut).toBe('A');
		click(first);
		expect(item('answer').dataset.status).toBe('answered');
		act(() => fixture.toggle());
		expect(item('answer').dataset.status).toBe('unanswered');
		act(() => fixture.toggle());
		const second = input('conditional-input');
		expect(second).not.toBe(first);
		expect(second.checked).toBe(true);
		expect(item('answer').dataset.status).toBe('answered');
	});

	it('supports render snippets and emits no primitive data slots', () => {
		setup('render');
		expect(el('progress').tagName).toBe('OUTPUT');
		expect(el('progress').textContent).toBe('1/1');
		expect(el('progress').getAttribute('role')).toBe('progressbar');
		expect(el('progress').hasAttribute('data-first')).toBe(true);
		expect(el('progress').hasAttribute('data-last')).toBe(true);
		expect(document.querySelector('[data-slot]')).toBeNull();
		expect(item('only').querySelector('legend')?.textContent).toBe('only');
		expect(button('submit').textContent).toBe('Submit');
		expect(button('submit').dataset.renderStatus).toBe('unanswered');
		expect(button('submit').dataset.status).toBe('unanswered');
		expect(button('submit').disabled).toBe(true);
		choose('only-choice');
		expect(button('submit').disabled).toBe(false);
	});

	it('renders a custom title element', () => {
		setup('custom-title');
		expect(el('custom-title').tagName).toBe('H2');
		expect(el('custom-title').textContent).toBe('Custom title');
		expect(item('only').getAttribute('aria-labelledby')).toBe('only-title');
	});
});

type CollectionFixture = {
	setItem(next: string): void;
	setDefinitions(next: { name: string; disabled?: boolean }[]): void;
	setIncludeChoice(next: boolean): void;
};

describe('Questionnaire with items', () => {
	function setupCollection(props: ComponentProps<typeof QuestionnaireCollectionHarness>) {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		instance = mount(QuestionnaireCollectionHarness, { target: document.body, props });
		flushSync();
		return { warn, fixture: instance as unknown as CollectionFixture };
	}

	it('joins the defined order to the rendered items without warnings', () => {
		const { warn } = setupCollection({ scenario: 'scope' });
		click(input('input-delegation'));
		click(button('next'));
		expect(el('progress').textContent).toBe('Question 2 of 2');
		expect(item('scope').hidden).toBe(true);
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		expect(warn).not.toHaveBeenCalled();
		expect(values('scope')).toEqual(['delegation']);
	});

	it('warns after falling back from an invalid default item', () => {
		const { warn } = setupCollection({ scenario: 'scope', defaultItem: 'missing' });
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] defaultItem "missing" does not identify an enabled item. The first enabled item will be used instead.'
			]
		]);
	});

	it('keeps definition shortcut order authoritative', () => {
		const { warn } = setupCollection({ scenario: 'order' });
		expect(el('choice-first').dataset.shortcut).toBe('B');
		keydown(item('order'), 'A');
		expect(input('input-second').checked).toBe(true);
		expect(input('input-first').checked).toBe(false);
		expect(input('input-second').getAttribute('aria-keyshortcuts')).toBe('A Enter');
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] Choice order for item "order" differs between Root.items and the rendered Questionnaire.Choice elements.'
			]
		]);
	});

	it('warns when rendered metadata differs from its definitions', () => {
		const { warn } = setupCollection({ scenario: 'mismatch' });
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] Item "answer" has different required values in Root.items and Questionnaire.Item.'
			],
			[
				'[Questionnaire] Choice "fixed" in item "answer" has different disabled values in Root.items and Questionnaire.Choice.'
			]
		]);
	});

	it('warns about duplicate item names and choice values', () => {
		const { warn } = setupCollection({ scenario: 'duplicates' });
		expect(warn.mock.calls).toEqual([
			['[Questionnaire] Choice value "fixed" is defined more than once in item "answer".'],
			['[Questionnaire] Item name "answer" is defined more than once.'],
			[
				'[Questionnaire] Item "answer" has different disabled values in Root.items and Questionnaire.Item.'
			]
		]);
	});

	it('does not assign shortcuts to choices the definitions omit', () => {
		const { warn } = setupCollection({ scenario: 'omitted' });
		expect(el('shortcut-fixed').hidden).toBe(true);
		expect(input('input-fixed').hasAttribute('aria-keyshortcuts')).toBe(false);
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] Rendered choice "fixed" in item "answer" is missing from Root.items and will not receive a shortcut.'
			]
		]);
	});

	it('follows reordered definitions and falls back when the active item is disabled', () => {
		const onItemChange = vi.fn();
		const { warn, fixture } = setupCollection({ scenario: 'dynamic', onItemChange });
		expect(el('progress').textContent).toBe('Question 2 of 3');

		act(() => fixture.setDefinitions([{ name: 'second' }, { name: 'first' }, { name: 'third' }]));
		expect(el('progress').textContent).toBe('Question 1 of 3');
		expect(button('previous').hidden).toBe(true);

		act(() =>
			fixture.setDefinitions([
				{ disabled: true, name: 'second' },
				{ name: 'first' },
				{ name: 'third' }
			])
		);
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(item('first').hasAttribute('data-active')).toBe(true);
		expect(onItemChange.mock.calls).toEqual([['first']]);
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] defaultItem "second" does not identify an enabled item. The first enabled item will be used instead.'
			]
		]);

		act(() => fixture.setDefinitions([{ name: 'first' }, { name: 'third' }, { name: 'fourth' }]));
		expect(el('progress').textContent).toBe('Question 1 of 3');
		expect(button('next').hidden).toBe(false);
		expect(item('fourth').hidden).toBe(true);
	});

	it('follows an item set from outside', () => {
		const { fixture } = setupCollection({ scenario: 'scope', item: 'scope' });
		act(() => fixture.setItem('detail'));
		expect(el('progress').textContent).toBe('Question 2 of 2');
		expect(item('scope').hidden).toBe(true);
		expect(item('detail').hasAttribute('data-active')).toBe(true);
		expect(document.activeElement).toBe(item('detail'));
	});

	it('reports a mismatch again after it resolves and recurs', () => {
		const { warn, fixture } = setupCollection({ scenario: 'recur' });
		expect(warn).not.toHaveBeenCalled();
		act(() => fixture.setIncludeChoice(false));
		expect(warn).toHaveBeenCalledTimes(1);
		act(() => fixture.setIncludeChoice(true));
		act(() => fixture.setIncludeChoice(false));
		expect(warn.mock.calls).toEqual([
			[
				'[Questionnaire] Rendered choice "fixed" in item "answer" is missing from Root.items and will not receive a shortcut.'
			],
			[
				'[Questionnaire] Rendered choice "fixed" in item "answer" is missing from Root.items and will not receive a shortcut.'
			]
		]);
	});
});
