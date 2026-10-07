import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';
import { mergeProps } from './mergeProps.js';

describe('mergeProps', () => {
	it('runs the consumer handler first and then the internal handler', () => {
		const order: string[] = [];
		const props = mergeProps(
			{ onclick: () => order.push('consumer') },
			{ onclick: () => order.push('internal') }
		) as { onclick: (event: Event) => void };
		props.onclick(new Event('click', { cancelable: true }));
		expect(order).toEqual(['consumer', 'internal']);
	});

	it('skips the internal handler when the consumer calls preventDefault', () => {
		const internal = vi.fn();
		const props = mergeProps(
			{
				onclick: (event: Event) => {
					event.preventDefault();
				}
			},
			{ onclick: internal }
		) as { onclick: (event: Event) => void };
		const event = new Event('click', { cancelable: true });
		props.onclick(event);
		expect(event.defaultPrevented).toBe(true);
		expect(internal).not.toHaveBeenCalled();
	});

	it('keeps the earliest plain prop and concatenates classes', () => {
		const props = mergeProps(
			{ id: 'consumer', class: 'consumer' },
			{ id: 'internal', class: 'internal' }
		);
		expect(props.id).toBe('consumer');
		expect(props.class).toBe('consumer internal');
	});

	it('lets the earliest style win when both bags set the same property', () => {
		const props = mergeProps({ style: 'color: red' }, { style: 'color: blue; margin: 0px' }) as {
			style: string;
		};
		expect(props.style).toContain('color: red');
		expect(props.style).toContain('margin: 0px');
		expect(props.style.indexOf('color: red')).toBeGreaterThan(props.style.indexOf('color: blue'));
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
});
