import { untrack } from 'svelte';

/**
 * Controlled/uncontrolled value owner, replacing Base UI's `useControlled`.
 *
 * The mode is fixed by whether the controlled input was defined at construction.
 * Controlled mode reads the owner's value live; uncontrolled mode starts from the
 * default and is updated only through `value =`.
 */
export class Controlled<T> {
	readonly isControlled: boolean;
	#controlled: () => T | undefined;
	#uncontrolled = $state() as T;

	constructor(controlled: () => T | undefined, initialDefault: () => T) {
		this.#controlled = controlled;
		this.isControlled = untrack(controlled) !== undefined;
		this.#uncontrolled = untrack(initialDefault);
	}

	get value(): T {
		return this.isControlled ? (this.#controlled() as T) : this.#uncontrolled;
	}

	set value(next: T) {
		if (!this.isControlled) {
			this.#uncontrolled = next;
		}
	}
}
