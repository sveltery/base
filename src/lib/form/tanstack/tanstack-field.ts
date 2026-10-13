// A FieldHandle over a TanStack Form field, so `<Field.Root field={tanstackField(field)}>` shows
// TanStack's values and errors. TanStack has no form-level input listener like Kit, so the
// props from `as()` carry an attachment that reports input to the field. Field reports blur
// through the handle's `blur()`, since a composite control focuses an element that has no name.

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

/**
 * The part of a TanStack `FieldApi` the adapter reads. A field from `form.Field` or
 * `createField` has it. Typed structurally because a concrete `FieldApi` does not assign to
 * TanStack's own `AnyFieldApi`.
 */
export interface TanstackFieldApi<V = unknown> {
	readonly name: string;
	readonly state: {
		readonly value: V;
		readonly meta: { readonly errors: unknown[]; isTouched: boolean; isDirty: boolean };
	};
	readonly options: { readonly defaultValue?: unknown };
	// Method syntax keeps the parameters bivariant, so TanStack's typed signatures assign.
	handleChange(value: NoInfer<V>): void;
	handleBlur(): void;
	readonly form: {
		readonly options: { readonly defaultValues?: unknown };
		resetField(name: string): void;
	};
}

/** Props for one native input: its name, its value or `checked`, and the attachment. */
export interface TanstackInputProps {
	name: string;
	type?: string;
	value?: unknown;
	defaultValue?: string;
	checked?: boolean;
	defaultChecked?: boolean;
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

const handles = new WeakMap<TanstackFieldApi, FieldHandle>();

/** Adds each entry as an enumerable getter, so a spread reads the field's current state. */
function getters(props: TanstackInputProps, entries: Record<string, () => unknown>) {
	for (const [name, get] of Object.entries(entries)) {
		Object.defineProperty(props, name, { enumerable: true, get });
	}
	return props;
}

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
 * TanStack owns the value and validation. The control reports `input` to the field, Field
 * reports blur, `meta.errors` become the Field's issues, and a native form reset resets the
 * field.
 */
export function tanstackField<V>(field: TanstackFieldApi<V>): TanstackFieldHandle<V> {
	type Handle = TanstackFieldHandle<V>;
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
					field.handleChange(readValue(node, array) as V);
				}),
				form ? onFormReset(form, { settle: () => field.form.resetField(field.name) }) : () => {}
			];
			return () => stops.forEach((stop) => stop());
		};
	const single = listen(false);
	const group = listen(true);

	/** The value `resetField` restores: the field's own default, else the form's. */
	const initial = () => {
		let value: unknown = field.form.options.defaultValues;
		for (const key of path) value = (value as Record<string | number, unknown> | undefined)?.[key];
		return field.options.defaultValue ?? value;
	};

	const handle = {
		// A native reset restores `defaultValue` and `defaultChecked`, so they carry TanStack's
		// defaults: the DOM and `resetField` then agree without either one writing the other.
		as: (type: string, option?: unknown, checked?: boolean): TanstackInputProps => {
			const array =
				type === 'select multiple' || (type === 'checkbox' && typeof option === 'string');
			const props: TanstackInputProps = { name: field.name, [key]: array ? group : single };
			if (type !== 'text' && type !== 'select' && type !== 'select multiple') props.type = type;
			if (type === 'select multiple') {
				props.multiple = true;
				return getters(props, {
					value: () => {
						const value = field.state.value ?? option;
						return Array.isArray(value) ? [...value] : [];
					}
				});
			}
			if (type === 'checkbox' || type === 'radio') {
				const lone = type === 'checkbox' && !array;
				if (!lone) props.value = option;
				const fallback = lone ? Boolean(option) : (checked ?? false);
				const isChecked = (value: unknown) => {
					if (value == null) return fallback;
					if (lone) return Boolean(value);
					return type === 'radio' ? value === option : (value as unknown[]).includes(option);
				};
				return getters(props, {
					defaultChecked: () => isChecked(initial()),
					checked: () => isChecked(field.state.value)
				});
			}
			const text = (value: unknown) => (value == null ? '' : String(value));
			return getters(props, {
				defaultValue: () => text(initial() ?? option),
				value: () => text(field.state.value ?? option)
			});
		},
		issues: () => {
			const errors: unknown[] = field.state.meta.errors.filter((error: unknown) => error != null);
			if (!errors.length) return undefined;
			return errors.map((error): FormIssue => ({ message: message(error), path }));
		},
		value: () => field.state.value,
		set: (value: unknown) => {
			field.handleChange(value as V);
			return value;
		},
		touched: () => field.state.meta.isTouched,
		dirty: () => field.state.meta.isDirty,
		blur: () => field.handleBlur()
	} satisfies FieldHandle & { blur(): void };
	handles.set(field, handle);
	return handle as Handle;
}
