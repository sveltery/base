import type { HTMLAttributes } from 'svelte/elements';

/** The part of Kit's remote form field that a radio group needs. */
interface RadioField {
	as(
		type: 'radio',
		value: string
	): { name: string; 'aria-invalid'?: HTMLAttributes<HTMLElement>['aria-invalid'] };
	value(): unknown;
}

/**
 * Design B: RadioGroup props for a Kit field, keyed for a group.
 * `.as('radio', option)` describes one option, so any option gives the shared name.
 */
export function radioGroupProps(field: RadioField) {
	const option = field.as('radio', 'any');
	return {
		name: option.name,
		get value() {
			return field.value();
		},
		get 'aria-invalid'() {
			return option['aria-invalid'];
		}
	};
}
