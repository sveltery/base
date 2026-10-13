// SvelteKit's remote-form name encoding and field proxy, shared by `parseForm` on the server and
// `actionForm` in the browser. Derived from SvelteKit 3.0.1 packages/kit/src/runtime/form-utils.js.
// MIT, see THIRD_PARTY_NOTICES.md. Kit does not export these, so they are copied, minus the
// `/form_id` name suffix that only remote forms carry.

import type { StandardSchemaV1 } from '@standard-schema/spec';
import { DEV } from 'esm-env';
import { pathKey, type FormIssue } from '../source.js';

export type Path = (string | number)[];

/** Submitted data that does not follow the field-name rules. The server answers it with a 400. */
export class FormDataError extends Error {
	override name = 'FormDataError';
}

export interface FormKey {
	/** The path string, `items[0].name`. */
	name: string;
	type: 'number' | 'boolean' | null;
	isArray: boolean;
}

/** Separates a field's path from the type prefix (`n:`, `b:`, `i:`) and `[]` suffix in its name. */
export function parseFormKey(key: string): FormKey {
	let name = key;
	let imageCoordinate = '';
	if (name.startsWith('i:') && (name.endsWith('.x') || name.endsWith('.y'))) {
		imageCoordinate = name[name.length - 1];
		name = name.slice(0, -2);
	}

	let type: FormKey['type'] = null;
	if (name.startsWith('n:') || name.startsWith('i:')) {
		name = name.slice(2);
		type = 'number';
	} else if (name.startsWith('b:')) {
		name = name.slice(2);
		type = 'boolean';
	}

	const isArray = name.endsWith('[]');
	if (isArray) name = name.slice(0, -2);
	if (imageCoordinate) name += `.${imageCoordinate}`;
	return { name, type, isArray };
}

export function coerceFormValue(type: FormKey['type'], value: unknown): unknown {
	if (Array.isArray(value)) return value.map((item) => coerceFormValue(type, item));
	if (type === 'number') return value === '' ? undefined : parseFloat(value as string);
	if (type === 'boolean') return value === 'on';
	return value;
}

/** Pass to `deepSet` to delete the last key of the path. */
export const DELETE_KEY = {};

/**
 * FormData as the nested object a schema validates: `n:age` is a number, `tags[]` an array.
 * With `strict: false`, an entry whose name cannot be a field is skipped instead of throwing.
 */
export function convertFormData(
	data: FormData,
	{ strict = true }: { strict?: boolean } = {}
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const fieldName of new Set(data.keys())) {
		try {
			const field = parseFormKey(fieldName);
			// An empty `<input type="file">` submits a nameless, empty file.
			const entries = data
				.getAll(fieldName)
				.filter((entry) => typeof entry === 'string' || entry.name !== '' || entry.size > 0);
			if (entries.length === 0 && !field.isArray) continue;
			if (entries.length > 1 && !field.isArray) {
				throw new FormDataError(
					`Form cannot contain duplicated keys: \`${field.name}\` has ${entries.length} values`
				);
			}
			deepSet(
				result,
				splitPath(field.name),
				coerceFormValue(field.type, field.isArray ? entries : entries[0])
			);
		} catch (error) {
			if (strict || !(error instanceof FormDataError)) throw error;
		}
	}
	return result;
}

const PATH = /^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/;

/** `items[0].name` as `['items', '0', 'name']`. Names that would need quoting in JS are rejected. */
export function splitPath(path: string): string[] {
	if (!PATH.test(path)) {
		throw new FormDataError(
			`Invalid field name \`${path}\`: field names are written in JS object notation`
		);
	}
	return path.split(/\.|\[|\]/).filter(Boolean);
}

function checkPrototypePollution(key: string) {
	if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
		throw new FormDataError(
			`Invalid key \`${key}\`: This key is not allowed to prevent prototype pollution`
		);
	}
}

/** Sets `value` at `keys`, creating objects and arrays on the way. Mutates `object`. */
export function deepSet(object: Record<string, unknown>, keys: string[], value: unknown) {
	let current: Record<string, unknown> = object;
	for (let i = 0; i < keys.length - 1; i += 1) {
		const key = keys[i];
		checkPrototypePollution(key);
		const isArray = /^\d+$/.test(keys[i + 1]);
		const inner = Object.hasOwn(current, key) ? current[key] : undefined;
		const exists = inner != null;
		if (exists && isArray !== Array.isArray(inner)) {
			throw new FormDataError(`Invalid array key \`${keys[i + 1]}\``);
		}
		if (!exists) {
			if (value === DELETE_KEY) return;
			current[key] = isArray ? [] : {};
		}
		current = current[key] as Record<string, unknown>;
	}
	const finalKey = keys[keys.length - 1];
	checkPrototypePollution(finalKey);
	if (value === DELETE_KEY) delete current[finalKey];
	else current[finalKey] = value;
}

export function deepGet(object: unknown, path: readonly (string | number)[]): unknown {
	let current = object;
	for (const key of path) {
		if (current === null || typeof current !== 'object' || !Object.hasOwn(current, key)) {
			return undefined;
		}
		current = (current as Record<string | number, unknown>)[key];
	}
	return current;
}

/** An issue with its path string, which is what fields look issues up by. */
export interface KeyedIssue extends FormIssue {
	name: string;
}

export function normalizeIssue(issue: StandardSchemaV1.Issue | FormIssue): KeyedIssue {
	const path = (issue.path ?? []).map(
		(segment) => (typeof segment === 'object' ? segment.key : segment) as string | number
	);
	return { name: pathKey(path), path, message: issue.message };
}

/** Issues by path string: each issue under every ancestor path, and all of them under `$`. */
export function flattenIssues(issues: readonly KeyedIssue[]): Record<string, KeyedIssue[]> {
	const result: Record<string, KeyedIssue[]> = Object.create(null);
	for (const issue of issues) {
		(result.$ ??= []).push(issue);
		let name = '';
		for (const key of issue.path) {
			name += typeof key === 'number' ? `[${key}]` : name === '' ? key : `.${key}`;
			(result[name] ??= []).push(issue);
		}
	}
	return result;
}

/** The state a field proxy reads and writes. */
export interface FieldStore {
	get(): Record<string, unknown>;
	set(path: Path, value: unknown): void;
	issues(): Record<string, KeyedIssue[]>;
	touched(): Record<string, boolean>;
	dirty(): Record<string, boolean>;
}

const TYPE_PREFIXES: Record<string, string | undefined> = { number: 'n:', boolean: 'b:' };

/** Adds props. A function becomes a getter computed on each read. */
function addProps(base: Record<string, unknown>, props: Record<string, unknown>) {
	for (const prop in props) {
		const value = props[prop];
		if (typeof value === 'function') {
			Object.defineProperty(base, prop, { enumerable: true, get: value as () => unknown });
		} else {
			base[prop] = value;
		}
	}
	return base;
}

function typePrefix(type: string, isArray: boolean, inputValue: unknown) {
	if (type === 'number' || type === 'range') return 'n:';
	if (type === 'image') return 'i:';
	if (type === 'checkbox' && !isArray) return 'b:';
	if (type === 'hidden' || type === 'submit') return TYPE_PREFIXES[typeof inputValue] ?? '';
	return '';
}

function deepClone(value: unknown): unknown {
	if (value === null || typeof value !== 'object') return value;
	if (value instanceof Date) return new Date(value.getTime());
	if (value instanceof File) return value;
	if (Array.isArray(value)) return value.map(deepClone);
	const clone: Record<string, unknown> = {};
	for (const key of Object.keys(value)) {
		clone[key] = deepClone((value as Record<string, unknown>)[key]);
	}
	return clone;
}

const publicIssue = (issue: KeyedIssue): FormIssue => ({
	path: issue.path,
	message: issue.message
});

function missingValue(type: string): never {
	throw new Error(`${type} inputs must have a value`);
}

/** A method of the field at `path`, or `undefined` for a nested field. */
function fieldMethod(store: FieldStore, path: Path, prop: string): unknown {
	const key = pathKey(path);
	switch (prop) {
		case 'set':
			return (value: unknown) => {
				store.set(path, value);
				return value;
			};
		case 'value':
			return () => deepClone(deepGet(store.get(), path));
		case 'issues':
		case 'allIssues': {
			const all = prop === 'allIssues';
			return () => {
				const issues = store.issues()[key === '' ? '$' : key];
				if (all) return issues?.map(publicIssue);
				const own = issues?.filter((issue) => issue.name === key).map(publicIssue);
				return own?.length ? own : undefined;
			};
		}
		case 'touched':
		case 'dirty':
			return () => {
				const object = prop === 'dirty' ? store.dirty() : store.touched();
				if (Object.hasOwn(object, key)) return true;
				for (const candidate in object) {
					if (!Object.hasOwn(object, candidate)) continue;
					if (key === '') return true;
					if (!candidate.startsWith(key)) continue;
					const next = candidate[key.length];
					if (next === '.' || next === '[') return true;
				}
				return false;
			};
		case 'as': {
			// The field's value, or `fallback` until the field has been edited.
			const read = (fallback?: unknown) =>
				deepGet(store.get(), path) ??
				(fallback !== undefined && Object.hasOwn(store.dirty(), key) ? undefined : fallback);

			return (type: string, inputValue?: unknown, checked?: boolean) => {
				const isArray =
					type === 'file multiple' ||
					type === 'select multiple' ||
					(type === 'checkbox' && typeof inputValue === 'string');
				const base: Record<string, unknown> = {
					name: typePrefix(type, isArray, inputValue) + key + (isArray ? '[]' : ''),
					get 'aria-invalid'() {
						return key in store.issues() ? 'true' : undefined;
					}
				};
				if (type !== 'text' && type !== 'select' && type !== 'select multiple') {
					base.type = type === 'file multiple' ? 'file' : type;
				}

				if (type === 'submit' || type === 'hidden') {
					if (DEV && inputValue == null) missingValue(`\`${type}\``);
					return addProps(base, {
						value: typeof inputValue === 'boolean' ? (inputValue ? 'on' : 'off') : inputValue
					});
				}

				if (type === 'select' || type === 'select multiple') {
					return addProps(base, {
						multiple: isArray,
						value: () => {
							const value = read(inputValue);
							return Array.isArray(value) ? [...value] : value;
						}
					});
				}

				if (type === 'checkbox' || type === 'radio') {
					// Radios and checkbox arrays take their option second and `checked` third.
					// A lone checkbox takes only `checked`, second.
					const hasOption = type === 'radio' || isArray;
					if (DEV && hasOption && !inputValue) {
						missingValue(type === 'radio' ? 'Radio' : 'Checkbox array');
					}
					if (hasOption) base.value = inputValue ?? 'on';
					else checked = inputValue as boolean | undefined;
					return addProps(base, {
						defaultChecked: checked,
						checked: () => {
							const value = read();
							if (value == null) return read(checked);
							if (type === 'radio') return value === inputValue;
							if (isArray) return (value as unknown[]).includes(inputValue);
							return value;
						}
					});
				}

				if (type === 'file' || type === 'file multiple') {
					return addProps(base, {
						multiple: isArray,
						files: () => {
							const value = read();
							const files = value instanceof File ? [value] : value;
							if (!Array.isArray(files) || !files.every((file) => file instanceof File)) {
								return null;
							}
							if (typeof DataTransfer === 'undefined') {
								return Object.assign({ length: files.length }, files);
							}
							const transfer = new DataTransfer();
							for (const file of files) transfer.items.add(file);
							return transfer.files;
						}
					});
				}

				if (type === 'image') return base;

				return addProps(base, {
					defaultValue: inputValue,
					value: () => String(read(inputValue) ?? '')
				});
			};
		}
	}
}

/** `fields`: each property access is the field at that path, with Kit's field methods. */
export function createFieldProxy(store: FieldStore, target: object = {}, path: Path = []): object {
	return new Proxy(target, {
		get(target, prop) {
			if (typeof prop === 'symbol') return (target as Record<symbol, unknown>)[prop];
			const next = [...path, /^\d+$/.test(prop) ? parseInt(prop, 10) : prop];
			return createFieldProxy(store, (fieldMethod(store, path, prop) as object) ?? {}, next);
		}
	});
}
