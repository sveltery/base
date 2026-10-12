import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { describe, expect, it } from 'vitest';
import { chain, mergeClass, mergeProps } from './mergeProps.js';

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

	it('skips the earlier handler when the rightmost calls preventDefault', () => {
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
		expect(order).toEqual(['right']);
	});

	it('skips the earlier handler for any event-shaped argument, such as one from an iframe', () => {
		const order: string[] = [];
		const props = mergeProps(
			{ onclick: () => order.push('left') },
			{
				onclick(event: Event) {
					order.push('right');
					event.preventDefault();
				}
			}
		) as { onclick: (event: unknown) => void };
		const event = {
			type: 'click',
			defaultPrevented: false,
			preventDefault() {
				this.defaultPrevented = true;
			}
		};
		props.onclick(event);
		expect(order).toEqual(['right']);
	});

	it('treats a React-cased handler as a plain prop', () => {
		const lower = () => 'lower';
		const upper = () => 'upper';
		const props = mergeProps({ onclick: lower }, { onClick: upper }) as Record<string, unknown>;
		expect(props.onclick).toBe(lower);
		expect(props.onClick).toBe(upper);
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

	it('ignores a style object', () => {
		const props = mergeProps({ style: 'color: red' }, { style: { color: 'blue' } }) as unknown as {
			style: string;
		};
		expect(props.style).toBe('color: red');
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

describe('chain', () => {
	it('runs the consumer handler, then the component handler unless the consumer prevented', () => {
		const order: string[] = [];
		const handler = chain(
			() => order.push('component'),
			(event: Event) => {
				order.push('consumer');
				if (order.length > 2) event.preventDefault();
			}
		);
		handler(new Event('pointerdown', { cancelable: true }));
		handler(new Event('pointerdown', { cancelable: true }));
		expect(order).toEqual(['consumer', 'component', 'consumer']);
	});
});
