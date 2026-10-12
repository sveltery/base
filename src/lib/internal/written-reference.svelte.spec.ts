import { describe, expect, it } from 'vitest';
import { WrittenReference } from './written-reference.svelte.js';

describe('WrittenReference', () => {
	it('returns the written object while the parent holds its proxy', () => {
		let held = $state<object | null>(null);
		const ref = new WrittenReference(
			() => held,
			(next) => {
				held = next;
			}
		);
		const option = { id: 'a' };
		ref.set(option);
		expect(held).not.toBe(option);
		expect(ref.current).toBe(option);
	});

	it('returns the parent value when the parent replaces the write', () => {
		let held = $state(3);
		const ref = new WrittenReference(
			() => held,
			() => {
				held = 5;
			}
		);
		ref.set(4);
		expect(ref.current).toBe(5);
	});

	it('returns the parent value when the parent replaces an object write', () => {
		let held = $state<string[]>(['b']);
		const ref = new WrittenReference(
			() => held,
			(next) => {
				held = next.slice(-1);
			}
		);
		ref.set(['a', 'b']);
		expect($state.snapshot(ref.current)).toEqual(['b']);
	});

	it('returns the parent value when the parent keeps its value', () => {
		const kept = { id: 'kept' };
		const ref = new WrittenReference<object>(
			() => kept,
			() => {}
		);
		ref.set({ id: 'next' });
		expect(ref.current).toBe(kept);
	});
});
