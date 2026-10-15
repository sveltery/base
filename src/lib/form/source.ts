// The protocol between Base's Form and Field and an external owner of form state.
// A SvelteKit remote form satisfies `FormSource` and its `fields.x` satisfy `FieldHandle` as they
// are. Another owner can build the same shapes. Nothing here imports SvelteKit.

import { tick } from 'svelte';
import type { Attachment } from 'svelte/attachments';

/** One validation issue. Kit's `RemoteFormIssue` has this shape. */
export interface FormIssue {
	message: string;
	path: (string | number)[];
}

/**
 * The slice of SvelteKit's `RemoteFormField` that Field reads.
 * A remote form's `fields.email` satisfies it as is. Other sources build one.
 */
export interface FieldHandle {
	// Method syntax keeps the parameters bivariant, so Kit's typed `as` overloads still assign.
	/** Props for a native input of `type`: the encoded `name`, and `value` or `checked`. */
	as(type: string, value?: unknown, checked?: boolean): object;
	/** Issues on this exact path, or `undefined` when there are none. */
	issues(): FormIssue[] | undefined;
	value(): unknown;
	set(value: never): unknown;
	touched(): boolean;
	dirty(): boolean;
	/** Called when the Field's control loses focus. For sources that track touched themselves. */
	blur?(): void;
}

/** What `submit()` returns inside an `enhance` callback. Kit's adds `updates(...)`. */
export type EnhanceSubmission = Promise<boolean> & {
	updates: (...updates: never[]) => Promise<boolean>;
};

/** What an `enhance` callback receives. Kit's `RemoteFormEnhanceInstance` satisfies it. */
export interface EnhanceInstance {
	readonly element: HTMLFormElement;
	submit(): EnhanceSubmission;
}

/** What a source's `enhance` takes. Kit's `RemoteFormEnhanceCallback` has this shape. */
export type EnhanceCallback<I extends EnhanceInstance = EnhanceInstance> = (
	instance: I
) => void | Promise<void>;

/** Kit's default callback: submit, then reset the form once the submit succeeds. */
export async function defaultEnhance(instance: EnhanceInstance) {
	if (await instance.submit()) {
		await tick();
		if (instance.element.isConnected) instance.element.reset();
	}
}

/**
 * The slice of SvelteKit's `RemoteForm` that Form reads.
 * A remote form satisfies it as is. Other owners build one.
 * Form spreads it onto the `<form>`, so its enumerable keys must be form attributes and its
 * attachment, as Kit documents for `<form {...remote}>`.
 */
export interface FormSource {
	readonly method?: 'POST';
	readonly action?: string;
	/** Field handles by path. The root also carries `issues()` and `allIssues()`. */
	readonly fields: object;
	/** In-flight submits, client validation included. */
	readonly pending: number;
	/** True after a submit attempt, until reset. */
	readonly submitted: boolean;
	/** Re-run validation. `preflightOnly` skips the server. `all` includes untouched fields. */
	validate(options?: { all?: boolean; preflightOnly?: boolean }): Promise<void>;
	/** Replace what happens once the source has validated a submit. One callback per source. */
	enhance?(callback: EnhanceCallback): unknown;
	[attachment: symbol]: Attachment<HTMLFormElement> | ((node: HTMLFormElement) => void);
}

/** The instance a source's `enhance` callback receives. Kit's type when the source is Kit's. */
export type EnhanceInstanceOf<S> = S extends {
	enhance(callback: (instance: infer I) => void | Promise<void>): unknown;
}
	? I extends EnhanceInstance
		? I
		: EnhanceInstance
	: EnhanceInstance;

/** Native input types a Field can render. Composites declare the kind they submit as. */
type InputKind =
	| 'text'
	| 'email'
	| 'password'
	| 'url'
	| 'tel'
	| 'search'
	| 'number'
	| 'range'
	| 'date'
	| 'datetime-local'
	| 'time'
	| 'month'
	| 'week'
	| 'color'
	| 'checkbox'
	| 'radio'
	| 'select'
	| 'select multiple';

/**
 * Every control kind. `switch` is a Switch, which submits as a lone checkbox, so it fits
 * boolean fields only.
 */
export type ControlKind = InputKind | 'switch';

type WithSwitch<T> =
	T | ('checkbox' extends T ? ('select multiple' extends T ? never : 'switch') : never);

/**
 * Control kinds that fit a handle's value. Kit narrows `as()`'s first parameter by value type
 * (`'number' | 'range' | 'hidden' | 'submit'` for a number), so this narrows the same way.
 * `hidden`, `submit` and `file` are left out because a Field does not render them.
 */
export type ControlType<F> = F extends { as(...args: infer A): unknown }
	? string extends A[0]
		? ControlKind
		: WithSwitch<Extract<A[0], InputKind>>
	: ControlKind;

/** `type` is optional when a text input fits the value, and required otherwise. */
export type ControlTypeProp<F> =
	'text' extends ControlType<F> ? { type?: ControlType<F> } : { type: ControlType<F> };

/** The native input type a control kind submits as. */
export function nativeType(kind: ControlKind): Exclude<ControlKind, 'switch'> {
	return kind === 'switch' ? 'checkbox' : kind;
}

const SEGMENT = /[^.[\]]+/g;

/** The handle at a Kit path string such as `items[0].name`. */
export function resolveField(fields: object, name: string): FieldHandle {
	let current: unknown = fields;
	for (const segment of name.match(SEGMENT) ?? []) {
		current = (current as Record<string, unknown>)[segment];
	}
	return current as FieldHandle;
}

/** Every issue a source holds. Kit's root `fields.allIssues()`. */
export function allIssues(source: FormSource): FormIssue[] {
	const read: unknown = (source.fields as { allIssues?: unknown }).allIssues;
	return typeof read === 'function'
		? ((Reflect.apply(read, source.fields, []) as FormIssue[] | undefined) ?? [])
		: [];
}

/** Kit's path string for an issue path: `items[0].name`. */
export function pathKey(path: readonly (string | number)[]): string {
	let key = '';
	for (const segment of path) {
		key += typeof segment === 'number' ? `[${segment}]` : key === '' ? segment : `.${segment}`;
	}
	return key;
}
