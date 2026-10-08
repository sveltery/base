import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';
import { mergeClass, mergeProps } from './mergeProps.js';

describe('mergeProps', () => {
	it('lets the rightmost plain prop win and runs that bag’s handler first', () => {
		const order: string[] = [];
		const props = mergeProps(
			{ id: 'left', onmousedown: () => order.push('left') },
			{ id: 'right', onmousedown: () => order.push('right') }
		) as { id: string; onmousedown: (event: Event) => void };
		props.onmousedown(new Event('mousedown', { cancelable: true }));
		expect(props.id).toBe('right');
		expect(order).toEqual(['right', 'left']);
	});

	it('still runs the earlier handler when the rightmost calls preventDefault', () => {
		const order: string[] = [];
		const props = mergeProps(
			{
				onmousedown() {
					order.push('left');
				}
			},
			{
				onmousedown(event: Event) {
					order.push('right');
					event.preventDefault();
				}
			}
		) as { onmousedown: (event: Event) => void };
		const event = new Event('mousedown', { cancelable: true });
		props.onmousedown(event);
		expect(event.defaultPrevented).toBe(true);
		expect(order).toEqual(['right', 'left']);
	});

	it('stops the earlier handler when the rightmost calls preventBaseUIHandler', () => {
		const internal = vi.fn();
		const props = mergeProps(
			{ onmousedown: internal },
			{
				onmousedown(event: Event) {
					event.preventBaseUIHandler?.();
				}
			}
		) as { onmousedown: (event: Event) => void };
		const event = new Event('mousedown', { cancelable: true });
		props.onmousedown(event);
		expect(event.baseUIHandlerPrevented).toBe(true);
		expect(event.defaultPrevented).toBe(false);
		expect(internal).not.toHaveBeenCalled();
	});

	it('keeps an object class and a string class together, rightmost first', () => {
		const props = mergeProps({ class: { a: true } }, { class: 'b' });
		expect(props.class).toEqual(['b', { a: true }]);
	});

	it('lets the rightmost style win when both bags set the same property', () => {
		const props = mergeProps({ style: 'color: red' }, { style: 'color: blue; margin: 0px' }) as {
			style: string;
		};
		expect(props.style).toContain('color: blue');
		expect(props.style).toContain('margin: 0px');
		expect(props.style.indexOf('color: blue')).toBeGreaterThan(props.style.indexOf('color: red'));
	});

	it('runs every attachment', () => {
		const first = createAttachmentKey();
		const second = createAttachmentKey();
		const seen: string[] = [];
		const a: Attachment = () => {
			seen.push('a');
			return () => seen.push('a-cleanup');
		};
		const b: Attachment = () => {
			seen.push('b');
		};
		const props = mergeProps({ [first]: a }, { [second]: b });
		const node = {} as Element;
		const cleanupA = (props[first] as Attachment)(node);
		(props[second] as Attachment)(node);
		expect(seen).toEqual(['a', 'b']);
		if (typeof cleanupA === 'function') cleanupA();
		expect(seen).toEqual(['a', 'b', 'a-cleanup']);
	});

	it('gives a props getter the props merged so far and uses its return value', () => {
		const order: string[] = [];
		const props = mergeProps({ id: 'left', onclick: () => order.push('left') }, (previous) => {
			expect(previous.id).toBe('left');
			return {
				...previous,
				id: 'getter'
			};
		}) as unknown as { id: string; onclick: () => void };
		expect(props.id).toBe('getter');
		props.onclick();
		expect(order).toEqual(['left']);
	});
});

describe('mergeClass', () => {
	it('keeps the component class and a consumer object class', () => {
		expect(mergeClass('component', { consumer: true })).toEqual([{ consumer: true }, 'component']);
	});
});
