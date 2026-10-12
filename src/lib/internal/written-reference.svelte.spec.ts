import { describe, expect, it } from 'vitest';
import { WrittenReference } from './written-reference.svelte.js';

describe('WrittenReference', () => {
	it('returns the written object while the parent holds its proxy', () => {
		let held = $state<object | null>(null);
		const selection = new WrittenReference(
			() => held,
			(next) => {
				held = next;
			}
		);
		const option = { id: 'a' };
		selection.set(option);
		expect(held).not.toBe(option);
		expect(selection.current).toBe(option);
	});

	it('returns the parent value when the parent replaces the write', () => {
		let held = $state(3);
		const selection = new WrittenReference(
			() => held,
			() => {
				held = 5;
			}
		);
		selection.set(4);
		expect(selection.current).toBe(5);
	});

	it('returns the parent value when the parent replaces an object write', () => {
		let held = $state<string[]>(['b']);
		const selection = new WrittenReference(
			() => held,
			(next) => {
				held = next.slice(-1);
			}
		);
		selection.set(['a', 'b']);
		expect($state.snapshot(selection.current)).toEqual(['b']);
	});

	it('returns the parent value when the parent keeps its value', () => {
		const kept = { id: 'kept' };
		const selection = new WrittenReference<object>(
			() => kept,
			() => {}
		);
		selection.set({ id: 'next' });
		expect(selection.current).toBe(kept);
	});
});
