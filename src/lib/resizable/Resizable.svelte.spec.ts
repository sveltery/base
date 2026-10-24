// Assertions follow Sveltery UI tests/dom/resizable.test.ts at d3a0bd0, the behavior tests of
// @sveltery/resizable, which ports react-resizable-panels v4.5.8. Its styled-class checks stay in UI.
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ResizableHarness from '../../tests/ResizableHarness.svelte';
import ResizableSavedLayoutHarness from '../../tests/ResizableSavedLayoutHarness.svelte';

function setup(props: { onGroupElement?: (element: HTMLElement) => void } = {}) {
	const { component } = render(ResizableHarness, props);
	flushSync();
	const byId = (id: string) => document.getElementById(id)!;
	const grow = (id: string) => byId(id).style.flexGrow;
	const now = (id: string) => byId(id).getAttribute('aria-valuenow');
	const press = (id: string, key: string) => {
		byId(id).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
		flushSync();
	};
	return { byId, grow, now, press, harness: component };
}

describe('Resizable', () => {
	it('renders the group, panels and separator with the upstream attributes', () => {
		const { byId } = setup();
		const group = byId('horizontal');
		expect(group.className).toBe('horizontal');
		expect(group.hasAttribute('aria-orientation')).toBe(false);
		expect(group.style.flexDirection).toBe('row');
		expect(byId('vertical').style.flexDirection).toBe('column');
		expect(group.dataset.group).toBe('true');
		expect(group.dataset.testid).toBe('horizontal');
		const left = byId('left');
		expect(left.dataset.panel).toBe('true');
		expect(left.dataset.testid).toBe('left');
		expect(left.hasAttribute('class')).toBe(false);
		expect(left.style.overflow).toBe('hidden');
		expect(left.style.display).toBe('flex');
		const content = left.firstElementChild as HTMLElement;
		expect(content.className).toBe('left');
		expect(content.textContent).toBe('Left');
		expect(content.style.flexGrow).toBe('1');
		const handle = byId('handle');
		expect(handle.dataset.testid).toBe('handle');
		expect(handle.style.cursor).toBe('');
		expect(handle.style.flexGrow).toBe('0');
	});

	it('lays panels out from their default sizes', () => {
		const { grow, harness } = setup();
		expect(grow('left')).toBe('30');
		expect(grow('right')).toBe('70');
		expect(grow('top')).toBe('25');
		expect(grow('bottom')).toBe('75');
		expect(harness.groupApi().getLayout()).toEqual({ left: 30, right: 70 });
	});

	it('gives the separator its role and the value of the panel before it', () => {
		const { byId } = setup();
		const handle = byId('handle');
		expect(handle.getAttribute('role')).toBe('separator');
		expect(handle.getAttribute('aria-orientation')).toBe('vertical');
		expect(handle.getAttribute('aria-controls')).toBe('left');
		expect(handle.getAttribute('aria-valuenow')).toBe('30');
		expect(handle.getAttribute('aria-valuemin')).toBe('0');
		expect(handle.getAttribute('aria-valuemax')).toBe('80');
		expect(handle.getAttribute('tabindex')).toBe('0');
		expect(handle.dataset.separator).toBe('inactive');
		const vertical = byId('vertical-handle');
		expect(vertical.getAttribute('aria-orientation')).toBe('horizontal');
		expect(vertical.getAttribute('aria-controls')).toBe('top');
		expect(vertical.getAttribute('aria-valuenow')).toBe('25');
		expect(vertical.getAttribute('aria-valuemin')).toBe('0');
		expect(vertical.getAttribute('aria-valuemax')).toBe('100');
	});

	it('resizes with the arrow keys', () => {
		const { grow, now, press, harness } = setup();
		press('handle', 'ArrowRight');
		expect(now('handle')).toBe('35');
		expect(grow('left')).toBe('35');
		expect(grow('right')).toBe('65');
		expect(harness.groupApi().getLayout()).toEqual({ left: 35, right: 65 });
		press('handle', 'ArrowLeft');
		press('handle', 'ArrowLeft');
		expect(grow('left')).toBe('25');
		expect(grow('right')).toBe('75');
	});

	it('resizes a vertical group with ArrowUp and ArrowDown and ignores the horizontal keys', () => {
		const { grow, now, press } = setup();
		press('vertical-handle', 'ArrowDown');
		expect(now('vertical-handle')).toBe('30');
		expect(grow('top')).toBe('30');
		expect(grow('bottom')).toBe('70');
		press('vertical-handle', 'ArrowRight');
		expect(grow('top')).toBe('30');
		press('vertical-handle', 'ArrowUp');
		press('vertical-handle', 'ArrowUp');
		expect(grow('top')).toBe('20');
		expect(grow('bottom')).toBe('80');
	});

	it('moves to the limits with Home and End and toggles a collapsible panel with Enter', () => {
		const { grow, now, press, harness } = setup();
		press('handle', 'Home');
		expect(grow('left')).toBe('0');
		expect(grow('right')).toBe('100');
		expect(now('handle')).toBe('0');
		expect(harness.panelApi().isCollapsed()).toBe(true);
		press('handle', 'End');
		expect(grow('left')).toBe('80');
		expect(grow('right')).toBe('20');
		expect(harness.panelApi().isCollapsed()).toBe(false);
		press('handle', 'Enter');
		expect(grow('left')).toBe('0');
		expect(harness.panelApi().isCollapsed()).toBe(true);
		press('handle', 'Enter');
		expect(grow('left')).toBe('80');
		expect(harness.groupApi().getLayout()).toEqual({ left: 80, right: 20 });
	});

	it('leaves a key it does not handle alone and ignores Enter on a panel that cannot collapse', () => {
		const { byId, grow, press } = setup();
		const unhandled = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
		byId('handle').dispatchEvent(unhandled);
		expect(unhandled.defaultPrevented).toBe(false);
		press('vertical-handle', 'Enter');
		expect(grow('top')).toBe('25');
		press('handle', 'ArrowRight');
		expect(byId('handle').getAttribute('aria-valuenow')).toBe('35');
	});

	it('applies a layout set through bind:this after validating it', () => {
		const { grow, now, harness } = setup();
		expect(harness.groupApi().setLayout({ left: 60, right: 40 })).toEqual({ left: 60, right: 40 });
		flushSync();
		expect(grow('left')).toBe('60');
		expect(grow('right')).toBe('40');
		expect(now('handle')).toBe('60');
		expect(harness.groupApi().setLayout({ left: 4, right: 96 })).toEqual({ left: 0, right: 100 });
		flushSync();
		expect(grow('left')).toBe('0');
		expect(harness.groupApi().getLayout()).toEqual({ left: 0, right: 100 });
	});

	it('reports each settled layout once', () => {
		const { press, harness } = setup();
		expect(harness.changeLog()).toEqual(['{"left":30,"right":70}']);
		press('handle', 'ArrowRight');
		expect(harness.changeLog()).toEqual(['{"left":30,"right":70}', '{"left":35,"right":65}']);
		press('handle', 'End');
		press('handle', 'End');
		expect(harness.changeLog().at(-1)).toBe('{"left":80,"right":20}');
		expect(harness.changeLog().length).toBe(3);
	});

	it('collapses, expands and resizes a panel through bind:this', () => {
		const { grow, harness } = setup();
		const panel = harness.panelApi();
		expect(panel.isCollapsed()).toBe(false);
		panel.collapse();
		flushSync();
		expect(grow('left')).toBe('0');
		expect(panel.isCollapsed()).toBe(true);
		expect(panel.getSize().asPercentage).toBe(0);
		panel.expand();
		flushSync();
		expect(grow('left')).toBe('30');
		panel.resize('45%');
		flushSync();
		expect(grow('left')).toBe('45');
		expect(grow('right')).toBe('55');
		expect(panel.getSize().asPercentage).toBe(45);
	});

	it('resizes a panel to a size in pixels and rem', () => {
		const { grow, harness } = setup();
		const panel = harness.panelApi();
		panel.resize('400px');
		flushSync();
		expect(grow('left')).toBe('40');
		panel.resize(250);
		flushSync();
		expect(grow('left')).toBe('25');
		panel.resize('25rem');
		flushSync();
		expect(grow('left')).toBe('40');
	});

	it('gives an attachment the group element', () => {
		const elements: HTMLElement[] = [];
		const { byId } = setup({ onGroupElement: (element) => elements.push(element) });
		expect(elements).toEqual([byId('horizontal')]);
	});

	it('saves a layout in storage and restores it', () => {
		const store = new Map<string, string>();
		const storage = {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => void store.set(key, value)
		};
		const read = () => render(ResizableSavedLayoutHarness, { storage }).component.layout();
		const first = read();
		expect(first.defaultLayout).toBeUndefined();
		first.onLayoutChanged({ left: 40, right: 60 });
		expect(store.get('react-resizable-panels:editor')).toBe('{"left":40,"right":60}');
		expect(read().defaultLayout).toEqual({ left: 40, right: 60 });
	});
});
