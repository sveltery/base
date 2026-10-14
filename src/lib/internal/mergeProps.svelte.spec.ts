import { describe, expect, it } from 'vitest';
import { forwardConsumerPrevention, mergeProps, preventBaseUIHandler } from './mergeProps.js';

type KeyHandler = (event: KeyboardEvent) => void;

/** A popup around an input, each with a component handler and a consumer handler. */
function nest(inputConsumer: KeyHandler, popupConsumer?: KeyHandler) {
	const calls: string[] = [];
	const popup = document.createElement('div');
	const input = document.createElement('input');
	popup.append(input);
	document.body.append(popup);
	const inputProps = mergeProps(
		{ onkeydown: () => calls.push('input component') },
		{ onkeydown: forwardConsumerPrevention(inputConsumer) }
	);
	const popupProps = mergeProps(
		{ onkeydown: () => calls.push('popup component') },
		{ onkeydown: popupConsumer }
	);
	input.addEventListener('keydown', inputProps.onkeydown as KeyHandler);
	popup.addEventListener('keydown', popupProps.onkeydown as KeyHandler);
	const press = () => {
		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
		);
		popup.remove();
		return calls;
	};
	return { calls, press };
}

describe('preventBaseUIHandler', () => {
	it('skips the component handlers on the ancestors a forwarded consumer prevention reaches', () => {
		const { calls, press } = nest(
			(event) => {
				calls.push('input consumer');
				event.preventDefault();
			},
			() => calls.push('popup consumer')
		);
		expect(press()).toEqual(['input consumer', 'popup consumer']);
	});

	it('runs every component handler when the consumer does not prevent', () => {
		const { calls, press } = nest(() => calls.push('input consumer'));
		expect(press()).toEqual(['input consumer', 'input component', 'popup component']);
	});

	it('skips the handlers to the left when a component handler calls it', () => {
		const calls: string[] = [];
		const props = mergeProps(
			{ onkeydown: () => calls.push('left') },
			{
				onkeydown(event: KeyboardEvent) {
					calls.push('right');
					preventBaseUIHandler(event);
				}
			}
		);
		const event = new KeyboardEvent('keydown', { cancelable: true });
		(props.onkeydown as KeyHandler)(event);
		expect([calls, event.defaultPrevented]).toEqual([['right'], false]);
	});
});
