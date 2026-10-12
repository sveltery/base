// A small stand-in for a SvelteKit remote form: the same `FormSource` and `FieldHandle`
// protocol, flat field names, `n:` for numbers and a `/fake` form id suffix.

import { tick } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import { on } from 'svelte/events';
import type {
	EnhanceCallback,
	EnhanceInstance,
	EnhanceSubmission,
	FieldHandle,
	FormIssue,
	FormSource
} from '../lib/form/source.js';

type Values = Record<string, unknown>;
type Check = (values: Values) => FormIssue[];
interface Issue extends FormIssue {
	server: boolean;
}

const SUFFIX = '/fake';

function decode(name: string) {
	const key = name.endsWith(SUFFIX) ? name.slice(0, -SUFFIX.length) : name;
	return key.startsWith('n:') ? { key: key.slice(2), number: true } : { key, number: false };
}

function read(form: HTMLFormElement): Values {
	const values: Values = {};
	for (const [name, value] of new FormData(form)) {
		const { key, number } = decode(name);
		values[key] = number ? (value === '' ? undefined : Number(value)) : value;
	}
	return values;
}

/** Client issues replace server issues on the same path, as in Kit. */
function merge(current: Issue[], client: FormIssue[]): Issue[] {
	const paths = new Set(client.map((issue) => issue.path.join('.')));
	return [
		...current.filter((issue) => issue.server && !paths.has(issue.path.join('.'))),
		...client.map((issue) => ({ ...issue, server: false }))
	];
}

export class FakeSource implements FormSource {
	readonly method = 'POST' as const;
	readonly [attachment: symbol]: (form: HTMLFormElement) => () => void;

	#values = $state<Values>({});
	#issues = $state.raw<Issue[]>([]);
	#pending = $state(0);
	#submitted = $state(false);
	#element: HTMLFormElement | null = null;
	#callback: EnhanceCallback = async (instance) => {
		if (await instance.submit()) {
			await tick();
			if (instance.element.isConnected) HTMLFormElement.prototype.reset.call(instance.element);
		}
	};
	#handles = new Map<string, FieldHandle>();
	#schema: Check;
	#server: Check;
	/** Values of each request that reached the server. */
	readonly requests: Values[] = [];
	/** Issues present at construction, like a page rendered after a submit without JavaScript. */
	constructor(options: { schema?: Check; server?: Check; initialIssues?: FormIssue[] } = {}) {
		this.#schema = options.schema ?? (() => []);
		this.#server = options.server ?? (() => []);
		this.#issues = (options.initialIssues ?? []).map((issue) => ({ ...issue, server: true }));
		Object.defineProperty(this, createAttachmentKey(), {
			enumerable: true,
			value: (form: HTMLFormElement) => this.#attach(form)
		});
	}

	get pending() {
		return this.#pending;
	}

	get submitted() {
		return this.#submitted;
	}

	get fields(): Record<string, FieldHandle> & { allIssues(): FormIssue[] | undefined } {
		const allIssues = () =>
			this.#issues.length
				? this.#issues.map(({ message, path }) => ({ message, path }))
				: undefined;
		return new Proxy({} as Record<string, FieldHandle> & { allIssues: typeof allIssues }, {
			get: (_, key) => (key === 'allIssues' ? allIssues : this.#handle(String(key)))
		});
	}

	/** The callback Form registered, so a spec can call it like the source would. */
	get callback() {
		return this.#callback;
	}

	enhance(callback: EnhanceCallback) {
		this.#callback = callback;
		return this;
	}

	async validate({ all = false, preflightOnly = false } = {}) {
		void all;
		void preflightOnly;
		await tick();
		if (!this.#element) return;
		this.#issues = merge(this.#issues, this.#schema(read(this.#element)));
	}

	#handle(key: string): FieldHandle {
		let handle = this.#handles.get(key);
		if (handle) return handle;
		// eslint-disable-next-line @typescript-eslint/no-this-alias -- the handle is a plain object
		const source = this;
		handle = {
			as(type: string, value?: unknown) {
				const props: Record<string, unknown> = {
					name: (type === 'number' ? 'n:' : '') + key + SUFFIX,
					get 'aria-invalid'() {
						return source.#issues.some((issue) => issue.path.join('.') === key)
							? 'true'
							: undefined;
					},
					defaultValue: value,
					get value() {
						return String(source.#values[key] ?? value ?? '');
					}
				};
				if (type !== 'text') props.type = type;
				return props;
			},
			issues() {
				const own = source.#issues
					.filter((issue) => issue.path.join('.') === key)
					.map(({ message, path }) => ({ message, path }));
				return own.length ? own : undefined;
			},
			value: () => this.#values[key],
			set: (value: never) => (this.#values[key] = value),
			touched: () => false,
			dirty: () => false
		};
		this.#handles.set(key, handle);
		return handle;
	}

	#attach(form: HTMLFormElement) {
		this.#element = form;
		const stops = [
			on(form, 'submit', (event) => void this.#submit(event)),
			on(form, 'input', (event) => {
				const input = event.target as HTMLInputElement;
				if (!input.name) return;
				const { key, number } = decode(input.name);
				this.#values[key] = number ? input.valueAsNumber : input.value;
			}),
			on(form, 'reset', async () => {
				await tick();
				this.#values = read(form);
				this.#issues = [];
				this.#submitted = false;
			})
		];
		return () => {
			for (const stop of stops) stop();
			this.#element = null;
		};
	}

	async #submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const values = read(form);
		this.#submitted = true;
		this.#pending++;
		try {
			await Promise.resolve();
			const client = this.#schema(values);
			if (client.length) {
				this.#issues = merge(this.#issues, client);
				return;
			}
			const instance: EnhanceInstance = {
				element: form,
				submit: () => {
					const submission = (async () => {
						await Promise.resolve();
						this.requests.push(values);
						this.#issues = this.#server(values).map((issue) => ({ ...issue, server: true }));
						return this.#issues.length === 0;
					})() as EnhanceSubmission;
					submission.updates = () => submission;
					return submission;
				}
			};
			await this.#callback(instance);
		} finally {
			this.#pending--;
		}
	}
}
