// Ported from Sveltery UI tests/dom/command.test.ts (main d3a0bd0), which tests cmdk 1.1.1 behavior.
// MIT, see THIRD_PARTY_NOTICES.md.
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import CommandDuplicateHarness from '../../tests/CommandDuplicateHarness.svelte';
import CommandDynamicHarness from '../../tests/CommandDynamicHarness.svelte';
import CommandEdgeHarness from '../../tests/CommandEdgeHarness.svelte';
import CommandHarness from '../../tests/CommandHarness.svelte';
import CommandPropsHarness from '../../tests/CommandPropsHarness.svelte';

type Bound = { bound(): { value: string; search: string }; setValue(value: string): void };
type Dynamic = Bound & {
	setItems(items: string[]): void;
	setText(text: string): void;
	setBroken(broken: boolean): void;
};

let instance: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (instance) await unmount(instance);
	instance = undefined;
	document.body.replaceChildren();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function setup(props: Record<string, unknown> = {}) {
	instance = mount(CommandHarness, { target: document.body, props });
	flushSync();
	return instance as unknown as Bound;
}

function setupDynamic(props: Record<string, unknown> = {}) {
	instance = mount(CommandDynamicHarness, { target: document.body, props });
	flushSync();
	return instance as unknown as Dynamic;
}

function setupDuplicates(props: Record<string, unknown> = {}) {
	instance = mount(CommandDuplicateHarness, { target: document.body, props });
	flushSync();
	return instance as unknown as Bound;
}

function recordScrolls() {
	const scrolled: string[] = [];
	Element.prototype.scrollIntoView = function (this: HTMLElement) {
		scrolled.push(this.dataset.testid ?? this.textContent!);
	};
	onTestFinished(() => {
		delete (Element.prototype as Partial<Element>).scrollIntoView;
	});
	return scrolled;
}

function el<T extends HTMLElement = HTMLElement>(testId: string) {
	const element = document.querySelector<T>(`[data-testid="${testId}"]`);
	if (!element) throw new Error(`Missing test element: ${testId}`);
	return element;
}
const input = () => el<HTMLInputElement>('input');
const query = (testId: string) => document.querySelector(`[data-testid="${testId}"]`);

function type(value: string) {
	const element = input();
	element.focus();
	element.value = value;
	element.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
}
function press(key: string, options: KeyboardEventInit = {}) {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, ...options });
	input().dispatchEvent(event);
	flushSync();
	return event;
}
function pointer(testId: string) {
	el(testId).dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true }));
	flushSync();
}
function click(testId: string) {
	el(testId).click();
	flushSync();
}

function active() {
	const id = input().getAttribute('aria-activedescendant');
	return id ? document.getElementById(id)?.dataset.testid : undefined;
}
const selected = () =>
	[...document.querySelectorAll<HTMLElement>('[cmdk-item][aria-selected="true"]')].map(
		(item) => item.dataset.testid
	);

const partOrder = (container: string) =>
	[...document.querySelector(container)!.children].flatMap((child) =>
		[...child.attributes].some((attribute) => attribute.name.startsWith('cmdk-'))
			? [(child as HTMLElement).dataset.testid]
			: []
	);
const visualOrder = () =>
	[...document.querySelectorAll<HTMLElement>('[cmdk-item]')]
		.filter((item) => !item.closest('[hidden]'))
		.map((item) => item.dataset.testid);

function keyboardOrder() {
	press('Home');
	const order = [active()];
	while (order.length <= document.querySelectorAll('[cmdk-item]').length) {
		press('ArrowDown');
		const next = active();
		if (next === order.at(-1)) return order;
		order.push(next);
	}
	return order;
}

describe('Command', () => {
	it('renders the cmdk anatomy and wires its ARIA', () => {
		setup();
		const root = el('root');
		const label = root.querySelector('[cmdk-label]')!;
		const list = el('list');
		const fruits = el('fruits');
		const heading = fruits.querySelector('[cmdk-group-heading]')!;
		const items = fruits.querySelector('[cmdk-group-items]')!;

		expect(root.hasAttribute('cmdk-root')).toBe(true);
		expect(root.getAttribute('tabindex')).toBe('-1');
		expect(root.className).toBe('menu');
		expect(label.textContent).toBe('Command menu');
		expect(label.getAttribute('for')).toBe(input().id);
		expect((label as HTMLElement).style.position).toBe('absolute');
		expect(input().hasAttribute('cmdk-input')).toBe(true);
		expect(input().getAttribute('role')).toBe('combobox');
		expect(input().getAttribute('aria-autocomplete')).toBe('list');
		expect(input().getAttribute('aria-expanded')).toBe('true');
		expect(input().getAttribute('aria-controls')).toBe(list.id);
		expect(input().getAttribute('aria-labelledby')).toBe(label.id);
		expect(input().getAttribute('autocomplete')).toBe('off');
		expect(input().getAttribute('autocorrect')).toBe('off');
		expect(input().getAttribute('spellcheck')).toBe('false');
		expect(input().type).toBe('text');
		expect(input().placeholder).toBe('Type a command');
		expect(list.hasAttribute('cmdk-list')).toBe(true);
		expect(list.getAttribute('role')).toBe('listbox');
		expect(list.getAttribute('aria-label')).toBe('Suggestions');
		expect(list.getAttribute('tabindex')).toBe('-1');
		expect(list.querySelector('[cmdk-list-sizer]')!.getAttribute('style')).toBe(null);
		expect(items.getAttribute('style')).toBe(null);
		expect(fruits.getAttribute('role')).toBe('presentation');
		expect(fruits.dataset.value).toBe('Fruits');
		expect(heading.textContent).toBe('Fruits');
		expect(heading.getAttribute('aria-hidden')).toBe('true');
		expect(items.getAttribute('role')).toBe('group');
		expect(items.getAttribute('aria-labelledby')).toBe(heading.id);
		expect(el('apple').getAttribute('role')).toBe('option');
		expect(el('apple').dataset.value).toBe('Apple');
		expect(el('settings').dataset.value).toBe('Settings');
		expect(el('pineapple').dataset.value).toBe('pineapple');
		expect(el('cabbage').getAttribute('aria-disabled')).toBe('true');
		expect(el('cabbage').dataset.disabled).toBe('true');
		expect(el('carrot').getAttribute('aria-disabled')).toBe('false');
		expect(el('carrot').dataset.disabled).toBe('false');
		expect(el('separator').getAttribute('role')).toBe('separator');
		expect(query('empty')).toBe(null);
	});

	it('selects the first item on mount and reports it', () => {
		const onValueChange = vi.fn();
		const fixture = setup({ onValueChange });
		expect(fixture.bound().value).toBe('Apple');
		expect(onValueChange.mock.calls).toEqual([['Apple']]);
		expect(input().getAttribute('aria-activedescendant')).toBe(el('apple').id);
		expect(el('list').getAttribute('aria-activedescendant')).toBe(el('apple').id);
		expect(el('apple').getAttribute('aria-selected')).toBe('true');
		expect(el('apple').dataset.selected).toBe('true');
		expect(el('banana').getAttribute('aria-selected')).toBe('false');
		expect(el('banana').dataset.selected).toBe('false');
	});

	it('walks items in document order with the arrow keys, skipping disabled ones', () => {
		const fixture = setup();
		expect(keyboardOrder()).toEqual([
			'apple',
			'banana',
			'pineapple',
			'carrot',
			'asparagus',
			'settings'
		]);
		expect(press('ArrowDown').defaultPrevented).toBe(true);
		expect(active()).toBe('settings');
		press('ArrowUp');
		expect(active()).toBe('asparagus');
		press('ArrowUp');
		expect(active()).toBe('carrot');
		expect(fixture.bound().value).toBe('Carrot');
		press('Home');
		press('ArrowUp');
		expect(active()).toBe('apple');
	});

	it('wraps around the ends with loop', () => {
		setup({ loop: true });
		press('ArrowUp');
		expect(active()).toBe('settings');
		press('ArrowDown');
		expect(active()).toBe('apple');
	});

	it('jumps to the ends with Home, End and Meta+Arrow', () => {
		setup();
		expect(press('End').defaultPrevented).toBe(true);
		expect(active()).toBe('settings');
		press('Home');
		expect(active()).toBe('apple');
		press('ArrowDown', { metaKey: true });
		expect(active()).toBe('settings');
		press('ArrowUp', { metaKey: true });
		expect(active()).toBe('apple');
	});

	it('jumps between groups with Alt+Arrow', () => {
		setup();
		press('ArrowDown', { altKey: true });
		expect(active()).toBe('carrot');
		// No group follows, so Alt+Down steps one item like cmdk.
		press('ArrowDown', { altKey: true });
		expect(active()).toBe('asparagus');
		press('ArrowUp', { altKey: true });
		expect(active()).toBe('apple');
		press('End');
		press('ArrowUp', { altKey: true });
		expect(active()).toBe('asparagus');
	});

	it('moves with the vim bindings unless they are turned off', () => {
		setup();
		press('n', { ctrlKey: true });
		expect(active()).toBe('banana');
		press('j', { ctrlKey: true });
		expect(active()).toBe('pineapple');
		press('k', { ctrlKey: true });
		expect(active()).toBe('banana');
		press('p', { ctrlKey: true });
		expect(active()).toBe('apple');
		press('j', { ctrlKey: true, metaKey: true });
		expect(active()).toBe('settings');
		expect(press('j').defaultPrevented).toBe(false);
		expect(active()).toBe('settings');
	});

	it('ignores the vim bindings when vimBindings is false', () => {
		setup({ vimBindings: false });
		expect(press('n', { ctrlKey: true }).defaultPrevented).toBe(false);
		press('j', { ctrlKey: true });
		expect(active()).toBe('apple');
	});

	it('ignores keys another handler prevented and keys an input method is composing', () => {
		setup();
		input().addEventListener(
			'keydown',
			(event) => event.key === 'ArrowDown' && event.preventDefault(),
			{ once: true }
		);
		press('ArrowDown');
		expect(active()).toBe('apple');
		expect(press('ArrowDown', { isComposing: true }).defaultPrevented).toBe(false);
		expect(active()).toBe('apple');
		press('ArrowDown');
		expect(active()).toBe('banana');
	});

	it('moves focus from Root to Input when the selection changes', () => {
		setup();
		el('root').focus();
		el('root').dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' })
		);
		flushSync();
		expect(active()).toBe('banana');
		expect(document.activeElement).toBe(input());
	});

	it('calls onSelect with the value on Enter and on click', () => {
		const onSelect = vi.fn();
		const fixture = setup({ onSelect });
		press('ArrowDown');
		expect(press('Enter').defaultPrevented).toBe(true);
		expect(onSelect.mock.calls).toEqual([['Banana']]);
		click('settings');
		expect(onSelect.mock.calls).toEqual([['Banana'], ['Settings']]);
		expect(fixture.bound().value).toBe('Settings');
		expect(active()).toBe('settings');
		click('cabbage');
		expect(onSelect).toHaveBeenCalledTimes(2);
		expect(active()).toBe('settings');
	});

	it('selects on pointer movement except over disabled items', () => {
		setup();
		pointer('carrot');
		expect(active()).toBe('carrot');
		pointer('cabbage');
		expect(active()).toBe('carrot');
		expect(selected()).toEqual(['carrot']);
	});

	it('ignores pointer movement with disablePointerSelection', () => {
		setup({ disablePointerSelection: true });
		pointer('carrot');
		expect(active()).toBe('apple');
	});

	it('filters, ranks and selects the best match as the search changes', () => {
		const onValueChange = vi.fn();
		const fixture = setup({ onValueChange });
		type('c');

		expect(fixture.bound().search).toBe('c');
		expect(query('apple')).toBe(null);
		expect(query('banana')).toBe(null);
		expect(query('asparagus')).toBe(null);
		expect(partOrder('[cmdk-list-sizer]')).toEqual(['settings', 'vegetables', 'fruits']);
		// Disabled Cabbage is not moved, as in cmdk, so it stays ahead of the items that move to the end of its group.
		expect(visualOrder()).toEqual(['settings', 'cabbage', 'carrot', 'pineapple']);
		expect(query('separator')).toBe(null);
		expect(query('empty')).toBe(null);
		expect(fixture.bound().value).toBe('Settings');
		expect(onValueChange.mock.calls).toEqual([['Apple'], ['Settings']]);
		expect(el('state').textContent).toBe(`c|Settings|4|${el('settings').id}`);
		expect(keyboardOrder()).toEqual(['settings', 'carrot', 'pineapple']);
	});

	it('orders groups by their best match and hides groups without matches', () => {
		setup();
		type('ap');
		expect(visualOrder()).toEqual(['apple', 'pineapple', 'asparagus']);
		expect(keyboardOrder()).toEqual(['apple', 'pineapple', 'asparagus']);
		expect(partOrder('[cmdk-list-sizer]')).toEqual(['fruits', 'vegetables']);
		expect(query('settings')).toBe(null);

		type('ca');
		expect(visualOrder()).toEqual(['cabbage', 'carrot', 'pineapple']);
		expect(active()).toBe('carrot');
		expect(el('fruits').hidden).toBe(false);

		type('set');
		expect(visualOrder()).toEqual(['settings']);
		expect(el('fruits').hidden).toBe(true);
		expect(el('fruits').getAttribute('style')).toBe(null);
		expect(el('vegetables').hidden).toBe(true);
		expect(partOrder('[cmdk-list-sizer]')).toEqual(['fruits', 'vegetables', 'settings']);
	});

	it('leaves no style attribute on items or groups once the search is cleared', () => {
		setup();
		type('ap');
		type('set');
		type('');
		const styled = [...document.querySelectorAll('[cmdk-item], [cmdk-group]')].filter((node) =>
			node.hasAttribute('style')
		);
		expect(styled).toEqual([]);
	});

	it('shows Empty and selects nothing when no item matches', () => {
		const fixture = setup();
		type('zzz');
		expect(el('empty').textContent).toBe('No results.');
		expect(el('empty').getAttribute('role')).toBe('presentation');
		expect(el('empty').hasAttribute('cmdk-empty')).toBe(true);
		expect(el('fruits').hidden).toBe(true);
		expect(el('vegetables').hidden).toBe(true);
		expect(fixture.bound().value).toBe('');
		expect(input().hasAttribute('aria-activedescendant')).toBe(false);
		expect(el('state').textContent).toBe('zzz||0|');
	});

	it('restores the declared order when the search is cleared', () => {
		setup();
		type('c');
		type('');
		expect(visualOrder()).toEqual([
			'apple',
			'banana',
			'pineapple',
			'carrot',
			'cabbage',
			'asparagus',
			'settings'
		]);
		expect(partOrder('[cmdk-list-sizer]')).toEqual([
			'fruits',
			'separator',
			'vegetables',
			'settings'
		]);
		expect(active()).toBe('apple');
	});

	it('matches keywords', () => {
		setup();
		type('tro');
		expect(visualOrder()).toEqual(['pineapple']);
		type('pref');
		expect(visualOrder()).toEqual(['settings']);
	});

	it('keeps force-mounted items visible without counting them', () => {
		const fixture = setup({ webItem: true });
		type('zzz');
		expect(visualOrder()).toEqual(['web']);
		expect(el('empty').textContent).toBe('No results.');
		expect(fixture.bound().value).toBe('Search the web for "zzz"');
		type('c');
		expect(visualOrder()).toEqual(['settings', 'web', 'cabbage', 'carrot', 'pineapple']);
	});

	it('keeps every item in declared order with shouldFilter false', () => {
		setup({ shouldFilter: false });
		type('zzz');
		expect(visualOrder()).toEqual([
			'apple',
			'banana',
			'pineapple',
			'carrot',
			'cabbage',
			'asparagus',
			'settings'
		]);
		expect(query('empty')).toBe(null);
		expect(active()).toBe('apple');
	});

	it('ranks with a custom filter', () => {
		const filter = vi.fn((value: string, search: string) =>
			value.toLowerCase().startsWith(search) ? 1 : 0
		);
		setup({ filter });
		type('c');
		expect(visualOrder()).toEqual(['cabbage', 'carrot']);
		expect(filter).toHaveBeenCalledWith('Settings', 'c', ['preferences']);
	});

	it('keeps an always-rendered separator while searching', () => {
		setup({ alwaysRender: true });
		type('c');
		expect(el('separator').hidden).toBe(false);
	});

	it('keeps a bound value that names a match when the search is set at mount', () => {
		const onValueChange = vi.fn();
		const fixture = setup({ value: 'Asparagus', search: 'a', onValueChange });
		expect(active()).toBe('asparagus');
		expect(fixture.bound().value).toBe('Asparagus');
		expect(onValueChange).not.toHaveBeenCalled();
		expect(visualOrder()).toEqual([
			'apple',
			'banana',
			'pineapple',
			'cabbage',
			'asparagus',
			'carrot'
		]);
	});

	it('keeps a bound value that names a hidden item at mount, and selects the best match once the search changes', () => {
		const onValueChange = vi.fn();
		const fixture = setup({ value: 'Banana', search: 'ap', onValueChange });
		expect(active()).toBe(undefined);
		expect(fixture.bound().value).toBe('Banana');
		expect(query('banana')).toBe(null);
		type('app');
		expect(active()).toBe('apple');
		expect(onValueChange.mock.calls).toEqual([['Apple']]);
	});

	it('reports the current text of a force-mounted item that shows the search', async () => {
		const onValueChange = vi.fn();
		const fixture = setup({ webItem: true, onValueChange });
		type('z');
		await tick();
		type('zz');
		await tick();
		expect(onValueChange.mock.calls).toEqual([
			['Apple'],
			['Search the web for "z"'],
			['Search the web for "zz"']
		]);
		expect(fixture.bound().value).toBe('Search the web for "zz"');
		expect(active()).toBe('web');
	});

	it('scrolls keyboard and search selections into view, with the group heading for the first item of a group', () => {
		const scrolled = recordScrolls();
		const fixture = setup();
		expect(active()).toBe('apple');
		press('ArrowDown');
		expect(scrolled).toEqual(['banana']);
		press('Home');
		expect(scrolled).toEqual(['banana', 'Fruits', 'apple']);
		type('c');
		expect(active()).toBe('settings');
		expect(scrolled).toEqual(['banana', 'Fruits', 'apple', 'settings']);
		press('ArrowDown');
		// Disabled Cabbage now leads Vegetables, so Carrot scrolls without the heading, as in cmdk.
		expect(scrolled).toEqual(['banana', 'Fruits', 'apple', 'settings', 'carrot']);
		type('');
		pointer('banana');
		fixture.setValue('Asparagus');
		flushSync();
		expect(active()).toBe('asparagus');
		click('settings');
		expect(scrolled).toEqual([
			'banana',
			'Fruits',
			'apple',
			'settings',
			'carrot',
			'Fruits',
			'apple'
		]);
	});

	it('does not scroll on mount or when the bound value changes after a keyboard move', () => {
		const scrolled = recordScrolls();
		const fixture = setup();
		expect(scrolled).toEqual([]);
		press('ArrowDown');
		fixture.setValue('Carrot');
		flushSync();
		expect(active()).toBe('carrot');
		expect(scrolled).toEqual(['banana']);
	});

	it('sets --cmdk-list-height from the sizer height', () => {
		let resize: () => void = () => {};
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: () => void) {
					resize = callback;
				}
				observe() {}
				disconnect() {}
			}
		);
		vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
			callback(0);
			return 1;
		});
		setup();
		const sizer = el('list').querySelector<HTMLElement>('[cmdk-list-sizer]')!;
		Object.defineProperty(sizer, 'offsetHeight', { value: 212 });
		resize();
		expect(el('list').style.getPropertyValue('--cmdk-list-height')).toBe('212.0px');
	});

	it('reads the state from a descendant', () => {
		setup();
		expect(el('state').textContent).toBe(`|Apple|7|${el('apple').id}`);
	});
});

describe('Command with duplicate values', () => {
	it('walks every item with the arrow keys', () => {
		setupDuplicates();
		expect(keyboardOrder()).toEqual(['apple1', 'pear', 'apple2', 'plum']);
	});

	it('selects the duplicate under the pointer without reporting a change', () => {
		const onValueChange = vi.fn();
		const fixture = setupDuplicates({ onValueChange });
		pointer('apple2');
		expect(active()).toBe('apple2');
		expect(selected()).toEqual(['apple2']);
		press('ArrowDown');
		expect(active()).toBe('plum');
		press('ArrowUp');
		expect(active()).toBe('apple2');
		expect(fixture.bound().value).toBe('Apple');
		expect(onValueChange.mock.calls).toEqual([['Apple'], ['Plum'], ['Apple']]);
	});

	it('maps a bound value write to the first item with that value', () => {
		const fixture = setupDuplicates();
		pointer('apple2');
		fixture.setValue('Pear');
		flushSync();
		expect(active()).toBe('pear');
		fixture.setValue('Apple');
		flushSync();
		expect(active()).toBe('apple1');
	});
});

describe('Command with changing items', () => {
	it('selects the first item when the selected one unmounts', () => {
		const fixture = setupDynamic();
		press('ArrowDown');
		expect(active()).toBe('two');
		fixture.setItems(['one', 'three']);
		flushSync();
		expect(active()).toBe('one');
		expect(fixture.bound().value).toBe('one');
	});

	it('keeps a preset value that names no item until an item with that value mounts', () => {
		const onValueChange = vi.fn();
		const fixture = setupDynamic({ value: 'four', onValueChange });
		expect(fixture.bound().value).toBe('four');
		expect(active()).toBe(undefined);
		fixture.setItems(['one', 'two', 'three', 'four']);
		flushSync();
		expect(active()).toBe('four');
		press('ArrowUp');
		expect(onValueChange.mock.calls).toEqual([['three']]);
	});

	it('forgets an item whose boundary failed, and keyboard order follows later reorders', async () => {
		const fixture = setupDynamic();
		fixture.setBroken(true);
		flushSync();
		await tick();
		expect(el('failed').textContent).toBe('failed');
		expect(query('ghost')).toBe(null);
		expect(keyboardOrder()).toEqual(['one', 'two', 'three', 'text']);
		press('End');
		expect(input().getAttribute('aria-activedescendant')).toBe(el('text').id);
		fixture.setItems(['three', 'one', 'two']);
		flushSync();
		await tick();
		expect(keyboardOrder()).toEqual(['three', 'one', 'two', 'text']);
	});

	it('ranks each new item a bounded number of times when many mount while searching', async () => {
		const searched: string[] = [];
		const filter = (value: string, search: string) => {
			searched.push(value);
			return value.includes(search) ? 1 : 0;
		};
		const fixture = setupDynamic({ filter });
		type('item');
		searched.length = 0;
		const items = Array.from({ length: 300 }, (_, index) => `item ${index}`);
		fixture.setItems(items);
		flushSync();
		await tick();
		const ranked = searched.filter((value) => value.startsWith('item '));
		expect(new Set(ranked).size).toBe(300);
		expect(ranked.length).toBeLessThan(3 * 300);
		expect(active()).toBe('item 0');
		expect(query('item 299')).not.toBe(null);
		expect(query('text')).toBe(null);
	});

	it('keeps the selection when items mount', () => {
		const fixture = setupDynamic();
		press('ArrowDown');
		fixture.setItems(['zero', 'one', 'two', 'three']);
		flushSync();
		expect(active()).toBe('two');
	});

	it('filters items that mount while searching', () => {
		const fixture = setupDynamic();
		type('fo');
		expect(el('empty').textContent).toBe('Nothing');
		fixture.setItems(['one', 'four']);
		flushSync();
		expect(query('four')).not.toBe(null);
		expect(query('one')).toBe(null);
		expect(query('empty')).toBe(null);
		expect(active()).toBe('four');
	});

	it('follows keyed reorders in keyboard order', async () => {
		const fixture = setupDynamic({ shouldFilter: false });
		fixture.setItems(['three', 'one', 'two']);
		flushSync();
		await tick();
		expect(keyboardOrder()).toEqual(['three', 'one', 'two', 'text']);
	});

	it('infers the value from text that changes after mount', async () => {
		const fixture = setupDynamic();
		expect(el('text').dataset.value).toBe('Draft');
		fixture.setText('Published');
		flushSync();
		await tick();
		expect(el('text').dataset.value).toBe('Published');
		type('pub');
		expect(query('text')).not.toBe(null);
		expect(query('one')).toBe(null);
		expect(active()).toBe('text');
	});
});

describe('Command outside the usual layout', () => {
	type Edge = { setItems(items: string[]): void; setLate(items: string[]): void };
	function setupEdge() {
		instance = mount(CommandEdgeHarness, { target: document.body });
		flushSync();
		return instance as unknown as Edge;
	}
	const order = () =>
		[
			...document.querySelectorAll<HTMLElement>(
				'[data-testid="portaled"] ~ * [cmdk-list-sizer] > [cmdk-item]'
			)
		].map((item) => item.dataset.testid);

	it('keeps the markup order of a List rendered outside Root', async () => {
		const fixture = setupEdge();
		fixture.setItems(['c', 'a', 'b']);
		flushSync();
		await tick();
		expect(order()).toEqual(['c', 'a', 'b']);
	});

	it('renders the parts of a Root nested in another List in place', () => {
		setupEdge();
		expect(el('nested').contains(el('inner'))).toBe(true);
	});

	it("leaves focus alone when another menu's selection changes", () => {
		const fixture = setupEdge();
		el('other-input').focus();
		input().focus();
		fixture.setLate(['x', 'y']);
		flushSync();
		expect(document.activeElement).toBe(input());
	});
});

describe('Command props that cmdk has and Svelte names', () => {
	function setupProps(props: Record<string, unknown> = {}) {
		instance = mount(CommandPropsHarness, { target: document.body, props });
		flushSync();
	}

	it('starts with the defaultValue item selected', () => {
		setupProps({ defaultValue: 'Banana' });
		expect(active()).toBe('banana');
		press('ArrowDown');
		expect(active()).toBe('cherry');
	});

	it('starts with the Input defaultValue as the search', () => {
		setupProps({ defaultSearch: 'ch' });
		expect(input().value).toBe('ch');
		expect(visualOrder()).toEqual(['cherry']);
	});

	it('skips its own handling when the consumer prevents the event', () => {
		const onSelect = vi.fn();
		setupProps({ prevent: true, onSelect });
		expect(press('ArrowDown').defaultPrevented).toBe(true);
		expect(active()).toBe('apple');
		pointer('banana');
		expect(active()).toBe('apple');
		click('cherry');
		expect(onSelect).not.toHaveBeenCalled();
		expect(active()).toBe('apple');
	});
});
