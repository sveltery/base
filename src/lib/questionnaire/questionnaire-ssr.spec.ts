import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { render } from 'svelte/server';
import QuestionnaireCollectionHarness from '../../tests/QuestionnaireCollectionHarness.svelte';

function serverRender(props: { scenario: string; defaultItem?: string; item?: string }) {
	const { body } = render(QuestionnaireCollectionHarness, { props });
	const { document } = new JSDOM(body).window;
	return <T extends Element = HTMLElement>(testId: string) => {
		const element = document.querySelector<T>(`[data-testid="${testId}"]`);
		if (!element) throw new Error(`Missing test element: ${testId}`);
		return element;
	};
}

describe('Questionnaire server rendering', () => {
	it('renders collection progress, active item, actions, and shortcuts', () => {
		const el = serverRender({ scenario: 'scope' });
		expect(el('root').dataset.current).toBe('1');
		expect(el('root').dataset.total).toBe('2');
		expect(el('root').hasAttribute('data-first')).toBe(true);
		expect(el('root').hasAttribute('novalidate')).toBe(true);
		expect(el('root').dataset.shortcuts).toBe('letters');
		expect(el('progress').textContent).toBe('Question 1 of 2');
		expect(el('progress').getAttribute('aria-valuenow')).toBe('1');
		expect(el('progress').getAttribute('aria-valuemax')).toBe('2');
		expect(el('scope').hasAttribute('data-active')).toBe(true);
		expect(el('scope').hidden).toBe(false);
		expect(el('disabled').hidden).toBe(true);
		expect(el('disabled').hasAttribute('inert')).toBe(true);
		expect(el('detail').hidden).toBe(true);
		expect(el('previous').hidden).toBe(true);
		expect(el('skip').hidden).toBe(true);
		expect(el('next').hidden).toBe(false);
		expect(el('next').dataset.status).toBe('unanswered');
		expect(el('next').getAttribute('aria-keyshortcuts')).toBe('Enter');
		expect(el('submit').hidden).toBe(true);
		expect(el('choice-delegation').dataset.shortcut).toBe('A');
		expect(el('input-delegation').getAttribute('aria-keyshortcuts')).toBe('A');
		expect(el('input-delegation').getAttribute('name')).toBe('scope');
		expect(el('input-delegation').getAttribute('type')).toBe('radio');
		expect(el('choice-automatic').hasAttribute('data-shortcut')).toBe(false);
		expect(el('shortcut-automatic').hidden).toBe(true);
		expect(el('choice-questions').dataset.shortcut).toBe('B');
		expect(el('shortcut-questions').textContent).toBe('B');
	});

	it('renders a requested optional item and its applicable actions', () => {
		const el = serverRender({ scenario: 'scope', defaultItem: 'detail' });
		expect(el('root').dataset.current).toBe('2');
		expect(el('root').hasAttribute('data-last')).toBe(true);
		expect(el('progress').textContent).toBe('Question 2 of 2');
		expect(el('scope').hidden).toBe(true);
		expect(el('detail').hasAttribute('data-active')).toBe(true);
		expect(el('previous').hidden).toBe(false);
		expect(el('skip').hidden).toBe(false);
		expect(el('next').hidden).toBe(true);
		expect(el('submit').hidden).toBe(false);
	});

	it('renders a bound item from the collection', () => {
		const el = serverRender({ scenario: 'scope', item: 'detail' });
		expect(el('progress').textContent).toBe('Question 2 of 2');
		expect(el('scope').hidden).toBe(true);
		expect(el('detail').hasAttribute('data-active')).toBe(true);
	});

	it.each(['missing', 'disabled'])(
		'falls back from an invalid default item %s during render',
		(defaultItem) => {
			const el = serverRender({ scenario: 'scope', defaultItem });
			expect(el('progress').textContent).toBe('Question 1 of 2');
			expect(el('scope').hasAttribute('data-active')).toBe(true);
			expect(el('detail').hidden).toBe(true);
		}
	);

	it('renders numeric shortcuts and leaves overflow choices unassigned', () => {
		const el = serverRender({ scenario: 'numeric' });
		expect(el('choice-choice-1').dataset.shortcut).toBe('1');
		expect(el('choice-choice-9').dataset.shortcut).toBe('9');
		expect(el('choice-choice-10').hasAttribute('data-shortcut')).toBe(false);
	});

	it('renders an input-only item without fixed-choice definitions', () => {
		const el = serverRender({ scenario: 'input-only' });
		expect(el('progress').textContent).toBe('Question 1 of 1');
		expect(el('input').hasAttribute('data-active')).toBe(true);
		expect(el<HTMLInputElement>('input-control').type).toBe('text');
		expect(el<HTMLInputElement>('input-control').value).toBe('Draft');
		expect(el('input-control').getAttribute('name')).toBe('input');
		expect(el('input-control').hasAttribute('data-filled')).toBe(true);
		expect(el('submit').hidden).toBe(false);
	});

	it('renders both navigation directions for a middle item', () => {
		const el = serverRender({ scenario: 'middle' });
		expect(el('progress').textContent).toBe('Question 2 of 3');
		expect(el('previous').hidden).toBe(false);
		expect(el('next').hidden).toBe(false);
		expect(el('submit').hidden).toBe(true);
	});

	it('renders a defaultChecked choice as checked', () => {
		const el = serverRender({ scenario: 'default-checked' });
		expect(el<HTMLInputElement>('input-default').checked).toBe(true);
		expect(el('choice-default').hasAttribute('data-checked')).toBe(true);
	});

	it('renders shortcuts in definition order', () => {
		const el = serverRender({ scenario: 'order' });
		expect(el('choice-first').dataset.shortcut).toBe('B');
		expect(el('choice-second').dataset.shortcut).toBe('A');
	});
});
