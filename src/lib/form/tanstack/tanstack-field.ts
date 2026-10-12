// A FieldHandle over a TanStack Form field, so `<Field.Root field={tanstackField(field)}>` shows
// TanStack's values and errors. TanStack has no form-level input listener like Kit, so the
// props from `as()` carry an attachment that reports input and blur to the field.

import type { AnyFieldApi } from '@tanstack/svelte-form';
import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import { onFormReset, ownerForm } from '../../internal/form-reset.svelte.js';
import type { FieldHandle, FormIssue } from '../source.js';

type TextKind =
	| 'text'
	| 'email'
	| 'password'
	| 'url'
	| 'tel'
	| 'search'
	| 'date'
	| 'datetime-local'
	| 'time'
	| 'month'
	| 'week'
	| 'color'
	| 'radio'
	| 'select';

/** Input types by the value they carry, as in Kit's `RemoteFormFieldType`. */
type InputTypeMap = { [K in TextKind]: string } & {
	number: number;
	range: number;
	checkbox: boolean | string[];
	'select multiple': string[];
};

/** The input types that can carry a value of type `V`. */
export type TanstackInputType<V> = {
	[K in keyof InputTypeMap]: NonNullable<V> extends InputTypeMap[K] ? K : never;
}[keyof InputTypeMap];

/** Props for one native input: its name, its value or `checked`, and the attachment. */
export interface TanstackInputProps {
	name: string;
	type?: string;
	value?: unknown;
	checked?: boolean;
	multiple?: boolean;
	[attachment: symbol]: Attachment<HTMLElement>;
}

/** A `FieldHandle` whose `as()` only takes input types that fit the field's value. */
export interface TanstackFieldHandle<V> extends FieldHandle {
	as(type: TanstackInputType<V>, value?: unknown, checked?: boolean): TanstackInputProps;
	value(): V;
	set(value: V): V;
}

function message(error: unknown): string {
	if (typeof error === 'string') return error;
	if (error && typeof error === 'object' && 'message' in error) return String(error.message);
	return String(error);
}

function splitName(name: string): (string | number)[] {
	return (name.match(/[^.[\]]+/g) ?? []).map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

const handles = new WeakMap<AnyFieldApi, FieldHandle>();

/** Reads one control's value in the shape TanStack holds it. */
function readValue(node: HTMLElement, array: boolean): unknown {
	if (node instanceof HTMLSelectElement) {
		return node.multiple ? Array.from(node.selectedOptions, (option) => option.value) : node.value;
	}
	if (!(node instanceof HTMLInputElement)) return (node as HTMLTextAreaElement).value;
	if (node.type === 'number' || node.type === 'range') {
		return node.value === '' ? undefined : node.valueAsNumber;
	}
	if (node.type === 'checkbox' && !array) return node.checked;
	if (node.type === 'checkbox') {
		const root = node.form ?? node.getRootNode();
		const named = (root as ParentNode).querySelectorAll<HTMLInputElement>(
			`input[type="checkbox"][name="${CSS.escape(node.name)}"]`
		);
		return Array.from(named)
			.filter((input) => input.checked)
			.map((input) => input.value);
	}
	return node.value;
}

/**
 * A `FieldHandle` for a TanStack Form field. Call it inside `form.Field`'s snippet:
 * `<Field.Root field={tanstackField(field)}>`. The handle is cached per field.
 *
 * TanStack owns the value and validation. The control reports `input` and `blur` to the field,
 * `meta.errors` become the Field's issues, and a native form reset resets the field.
 */
export function tanstackField<F extends AnyFieldApi>(
	field: F
): TanstackFieldHandle<F['state']['value']> {
	type Handle = TanstackFieldHandle<F['state']['value']>;
	const cached = handles.get(field);
	// The cache is keyed by the field, whose value type `Handle` is read from.
	if (cached) return cached as Handle;

	const path = splitName(field.name);
	const key = createAttachmentKey();
	const listen =
		(array: boolean): Attachment<HTMLElement> =>
		(node) => {
			const form = ownerForm(node);
			const stops = [
				on(node, 'input', () => {
					if (node instanceof HTMLInputElement && node.type === 'radio' && !node.checked) return;
					field.handleChange(readValue(node, array));
				}),
				on(node, 'blur', () => field.handleBlur()),
				form ? onFormReset(form, { settle: () => field.form.resetField(field.name) }) : () => {}
			];
			return () => stops.forEach((stop) => stop());
		};
	const single = listen(false);
	const group = listen(true);

	const handle = {
		as: (type: string, option?: unknown, checked?: boolean): TanstackInputProps => {
			const array =
				type === 'select multiple' || (type === 'checkbox' && typeof option === 'string');
			const props: TanstackInputProps = { name: field.name, [key]: array ? group : single };
			if (type !== 'text' && type !== 'select' && type !== 'select multiple') props.type = type;
			if (type === 'select multiple') props.multiple = true;
			if (type === 'radio' || (type === 'checkbox' && array)) {
				props.value = option;
				return Object.defineProperty(props, 'checked', {
					enumerable: true,
					get: () => {
						const value = field.state.value;
						if (value == null) return checked ?? false;
						return type === 'radio' ? value === option : (value as unknown[]).includes(option);
					}
				});
			}
			if (type === 'checkbox') {
				return Object.defineProperty(props, 'checked', {
					enumerable: true,
					get: () => Boolean(field.state.value ?? option)
				});
			}
			return Object.defineProperty(props, 'value', {
				enumerable: true,
				get: () => {
					const value = field.state.value ?? option;
					if (type === 'select multiple') return Array.isArray(value) ? [...value] : [];
					return value == null ? '' : String(value);
				}
			});
		},
		issues: () => {
			const errors: unknown[] = field.state.meta.errors.filter((error: unknown) => error != null);
			if (!errors.length) return undefined;
			return errors.map((error): FormIssue => ({ message: message(error), path }));
		},
		value: () => field.state.value,
		set: (value: unknown) => {
			field.handleChange(value);
			return value;
		},
		touched: () => field.state.meta.isTouched,
		dirty: () => field.state.meta.isDirty
	} satisfies FieldHandle;
	handles.set(field, handle);
	return handle as Handle;
}
