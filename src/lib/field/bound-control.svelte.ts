// The contract a composite control follows inside a Field bound to a form source
// (a remote form, or another owner that builds the same shapes). No Base UI equivalent.
// docs/porting.md "Composite form controls" states it for controls that adopt it later.
// 1. A real native input carries the value. Its `name`, the option `value` of a radio or
//    checkbox-group item, and any attachment `as()` returns come from the binding, so the
//    encoding is the source's and an adapter's listener sits on the input that changes.
// 2. The DOM is the write path. A user edit already fires `input` and `change` on that input,
//    and the source reads the value from those events.
// 3. The source's value is the control's initial value when it has one, and a later change of
//    it is written into the control without change callbacks.

import { untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { error } from '@sveltery/utils';
import { nativeType, type ControlKind, type FieldHandle } from '../form/source.js';
import type { FieldContext } from './model.svelte.js';

/**
 * The props a bound native input takes from its binding. Spread them onto that input.
 * Empty when the Field is not bound.
 */
export interface BoundInputProps {
	name?: string;
	value?: string;
	/** Attachments from `as()`, such as a source's listener for edits. */
	[attachment: symbol]: Attachment<HTMLInputElement>;
}

/**
 * The encoded `name`, the `value` of an option input, and the attachments for one native input
 * of `kind`. The other props `as()` returns (`checked`, `defaultValue`, `aria-invalid`, ...)
 * are left to the control, which owns its state and its defaults.
 */
export function boundInputProps(
	binding: FieldHandle | undefined,
	kind: ControlKind,
	option?: string
): BoundInputProps {
	if (!binding) return {};
	// `as()` getters read source state. Only `name`, `value` and the symbol keys are read.
	const props = binding.as(nativeType(kind), option) as { name?: unknown; value?: unknown };
	const result: BoundInputProps = { name: typeof props.name === 'string' ? props.name : undefined };
	if (option !== undefined) result.value = typeof props.value === 'string' ? props.value : option;
	for (const key of Object.getOwnPropertySymbols(props)) {
		const attachment: unknown = (props as Record<symbol, unknown>)[key];
		if (typeof attachment === 'function') result[key] = attachment as Attachment<HTMLInputElement>;
	}
	return result;
}

// After a submit without JavaScript, SvelteKit echoes the input as the raw FormData strings,
// without decoding `n:` and `b:` names, so a source can hold a value in its submitted form.

/** A source value as a boolean: `true`, or `'on'`, which a checked checkbox submits. */
export function sourceBoolean(raw: unknown): boolean {
	return raw === true || raw === 'on';
}

/**
 * A source value as a number: a number as is, or a numeric string decoded with `parseFloat`, as
 * Kit decodes an `n:` name. `undefined` for anything else.
 */
export function sourceNumber(raw: unknown): number | undefined {
	if (typeof raw === 'number') return raw;
	if (typeof raw !== 'string' || raw.trim() === '') return undefined;
	const parsed = parseFloat(raw);
	return Number.isNaN(parsed) ? undefined : parsed;
}

export interface BoundControlOptions<T> {
	/** The kind this control submits as. A Field.Root `type` that differs is a dev error. */
	kind: ControlKind;
	/** The control's current value. */
	read: () => T;
	/** Writes a value the way a reset restore does: through the value path, no change callbacks. */
	write: (value: T) => void;
	/** The control's value for a source value. `undefined` is the source's empty value. */
	fromSource: (raw: unknown) => T;
	equals?: (a: T, b: T) => boolean;
}

/** Binds a composite control to its Field's source. Construct during component init. */
export class BoundControl<T> {
	readonly #field: FieldContext;
	readonly #options: BoundControlOptions<T>;

	constructor(field: FieldContext, options: BoundControlOptions<T>) {
		this.#field = field;
		this.#options = options;
		const equals = options.equals ?? Object.is;

		$effect(() => {
			const declared = field.controlType;
			if (!field.binding || !declared || declared === options.kind) return;
			error(
				`A ${options.kind} control is inside a Field.Root declared as type="${declared}".`,
				`Set type="${options.kind}" on the Field.Root, or use a control of kind "${declared}".`
			);
		});

		// The handle `initial()` read, or the last one this effect saw. Its first value is
		// already the control's value unless it is empty, when the control keeps its default.
		let followed: FieldHandle | undefined = untrack(() => field.binding);
		let started = false;
		$effect(() => {
			const binding = field.binding;
			const raw = binding?.value();
			untrack(() => {
				const first = !started || binding !== followed;
				started = true;
				followed = binding;
				if (!binding || (first && raw === undefined)) return;
				const next = options.fromSource(raw);
				if (!equals(next, options.read())) options.write(next);
			});
		});
	}

	/** True inside a bound Field. */
	get bound(): boolean {
		return this.#field.binding !== undefined;
	}

	/** The value an empty binding starts from: the source's value when it has one, else `fallback`. */
	initial(fallback: T): T {
		const raw = untrack(() => this.#field.binding?.value());
		return raw === undefined ? fallback : this.#options.fromSource(raw);
	}

	/** Props for one native input (see `boundInputProps`), or `{}` when the Field is not bound. */
	inputProps(option?: string): BoundInputProps {
		return boundInputProps(this.#field.binding, this.#options.kind, option);
	}
}
