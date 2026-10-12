// A stand-in for a SvelteKit 3.0.1 remote form, for specs that must not depend on Kit.
// The name encoding, `as()` and the `input` and `reset` handling follow Kit's
// src/runtime/form-utils.js (`create_field_method`, `get_type_prefix`, `parse_form_key`,
// `convert_formdata`) and src/runtime/client/remote-functions/form.svelte.js (`handle_input`,
// `handle_reset`), for flat paths only.

import { tick } from 'svelte';
import { on } from 'svelte/events';
import type { FieldHandle, FormIssue } from '#lib/form/source.js';

type ValueType = 'number' | 'boolean' | null;

const typePrefixes: Record<string, string> = { number: 'n:', boolean: 'b:' };

function typePrefix(type: string, isArray: boolean, inputValue: unknown) {
	if (type === 'number' || type === 'range') return 'n:';
	if (type === 'checkbox' && !isArray) return 'b:';
	if (type === 'hidden' || type === 'submit') return typePrefixes[typeof inputValue] ?? '';
	return '';
}

function coerce(type: ValueType, value: unknown): unknown {
	if (Array.isArray(value)) return value.map((item) => coerce(type, item));
	if (type === 'number') return value === '' ? undefined : parseFloat(value as string);
	if (type === 'boolean') return value === 'on';
	return value;
}

export class FakeRemoteForm {
	readonly id: string;
	/** The source's values by path. */
	input = $state<Record<string, unknown>>({});
	readonly issues = $state<FormIssue[]>([]);
	#dirty: Record<string, boolean> = {};

	constructor(id = 'fake', initial: Record<string, unknown> = {}) {
		this.id = id;
		this.input = initial;
	}

	/** Kit's `parse_form_key`: the path, value type and array flag a native name encodes. */
	parseKey(key: string): { name: string; type: ValueType; isArray: boolean } {
		const suffix = `/${this.id}`;
		if (!key.endsWith(suffix)) throw new Error(`"${key}" is not a field of form "${this.id}"`);
		let name = key.slice(0, -suffix.length);
		let type: ValueType = null;
		if (name.startsWith('n:')) {
			name = name.slice(2);
			type = 'number';
		} else if (name.startsWith('b:')) {
			name = name.slice(2);
			type = 'boolean';
		}
		const isArray = name.endsWith('[]');
		if (isArray) name = name.slice(0, -2);
		return { name, type, isArray };
	}

	/** Kit's `convert_formdata`: what the server receives for this FormData. */
	decode(data: FormData): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		for (const key of data.keys()) {
			const field = this.parseKey(key);
			if (Object.hasOwn(result, field.name)) continue;
			const entries = data.getAll(key);
			if (entries.length > 1 && !field.isArray) {
				throw new Error(`${field.name} has ${entries.length} values`);
			}
			result[field.name] = coerce(field.type, field.isArray ? entries : entries[0]);
		}
		return result;
	}

	field(path: string): FieldHandle {
		const ownIssues = () => this.issues.filter((issue) => issue.path.join('.') === path);
		const read = () => this.input[path];
		return {
			as: (type: string, inputValue?: unknown, checked?: boolean) => {
				const isArray =
					type === 'select multiple' || (type === 'checkbox' && typeof inputValue === 'string');
				const props: Record<string, unknown> = {
					name:
						typePrefix(type, isArray, inputValue) + path + (isArray ? '[]' : '') + `/${this.id}`,
					get 'aria-invalid'() {
						return ownIssues().length ? 'true' : undefined;
					}
				};
				if (type !== 'text' && type !== 'select' && type !== 'select multiple') props.type = type;
				if (type === 'checkbox' || type === 'radio') {
					const hasOption = type === 'radio' || isArray;
					if (hasOption) props.value = inputValue ?? 'on';
					else checked = inputValue as boolean | undefined;
					props.defaultChecked = checked;
					Object.defineProperty(props, 'checked', {
						enumerable: true,
						get: () => {
							const value = read();
							if (value == null) return checked;
							if (type === 'radio') return value === inputValue;
							if (isArray) return (value as unknown[]).includes(inputValue);
							return value;
						}
					});
					return props;
				}
				props.defaultValue = inputValue;
				Object.defineProperty(props, 'value', {
					enumerable: true,
					get: () => String(read() ?? inputValue ?? '')
				});
				return props;
			},
			issues: () => {
				const own = ownIssues();
				return own.length ? own : undefined;
			},
			value: () => {
				const value = read();
				return Array.isArray(value) ? [...value] : value;
			},
			set: (value: never) => {
				this.input[path] = value;
				return value;
			},
			touched: () => false,
			dirty: () => Object.hasOwn(this.#dirty, path)
		};
	}

	/** Kit's form attachment, reduced to `handle_input` and `handle_reset`. */
	attach = (node: HTMLFormElement) => {
		const stopInput = on(node, 'input', (event) => {
			const element = event.target as HTMLInputElement;
			if (!element.name) return;
			const field = this.parseKey(element.name);
			if (field.isArray) {
				const elements = Array.from(
					node.querySelectorAll<HTMLInputElement>(`[name="${element.name}"]`)
				);
				let value = elements.map((input) => input.value);
				if (element.type === 'checkbox') value = value.filter((_, i) => elements[i].checked);
				this.input[field.name] = coerce(field.type, value);
			} else {
				this.input[field.name] = coerce(
					field.type,
					element.type === 'checkbox' && !element.checked ? null : element.value
				);
			}
			this.#dirty[field.name] = true;
		});
		const stopReset = on(node, 'reset', async () => {
			// Kit waits a tick, because the inputs reset after the event.
			await tick();
			this.input = this.decode(new FormData(node));
			this.#dirty = {};
		});
		return () => {
			stopInput();
			stopReset();
		};
	};
}
