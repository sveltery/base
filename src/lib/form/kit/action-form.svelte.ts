// The browser half of the form-action integration: a FormSource shaped like a remote form,
// built from the page's `form` prop and `use:enhance`, so Field markup is the same for both.
// State, input, focusout and reset handling follow SvelteKit 3.0.1
// packages/kit/src/runtime/client/remote-functions/form.svelte.js. MIT, see THIRD_PARTY_NOTICES.md.

import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { RemoteForm, RemoteFormInput } from '$app/server';
import { enhance as kitEnhance, type ActionResult, type SubmitFunction } from '$app/forms';
import { tick } from 'svelte';
import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import { onFormReset } from '../../internal/form-reset.svelte.js';
import { defaultEnhance, pathKey, type EnhanceCallback, type FormSource } from '../source.js';
import {
	convertFormData,
	coerceFormValue,
	createFieldProxy,
	deepGet,
	deepSet,
	DELETE_KEY,
	flattenIssues,
	FormDataError,
	normalizeIssue,
	parseFormKey,
	splitPath,
	type FieldStore,
	type KeyedIssue,
	type Path
} from './codec.js';
import type { FormFailure, FormSchema } from './parse-form.js';

/** What `submit()` returns inside `enhance`: whether the action succeeded or redirected. */
export type ActionFormSubmission = Promise<boolean> & {
	/** Skip the data refresh that follows a successful action, like a remote form's `updates()`. */
	updates(): Promise<boolean>;
};

/** What an `enhance` callback receives. */
export type ActionFormEnhanceInstance<Input extends RemoteFormInput, Result> = Pick<
	ActionForm<Input, Result>,
	'method' | 'action' | 'fields' | 'result' | 'pending' | 'submitted' | 'validate'
> & {
	readonly element: HTMLFormElement;
	/** Sends the request and resolves once its result is applied to the page. */
	submit(): ActionFormSubmission;
};

export type ActionFormEnhanceCallback<Input extends RemoteFormInput, Result> = EnhanceCallback<
	ActionFormEnhanceInstance<Input, Result>
>;

/** The page's `form` without the failures `parseForm` returns: what a successful action returned. */
export type ActionResultOf<F> = Exclude<NonNullable<F>, FormFailure<never>>;

function isFailure(value: unknown): value is FormFailure {
	return (
		typeof value === 'object' &&
		value !== null &&
		'action' in value &&
		'input' in value &&
		Array.isArray((value as { issues?: unknown }).issues)
	);
}

/** Kit's enhance instance: the source's state, plus the form element and `submit()`. */
function enhanceInstance<Input extends RemoteFormInput, Result>(
	source: ActionForm<Input, Result>,
	element: HTMLFormElement,
	submit: () => ActionFormSubmission
): ActionFormEnhanceInstance<Input, Result> {
	return {
		method: source.method,
		action: source.action,
		fields: source.fields,
		get result() {
			return source.result;
		},
		get pending() {
			return source.pending;
		},
		get submitted() {
			return source.submitted;
		},
		validate: (options) => source.validate(options),
		element,
		submit
	};
}

/** Reading the DOM never throws: a name that cannot be a field is skipped, and the server rejects it. */
function readForm(form: HTMLFormElement): Record<string, unknown> {
	const submitter = form.querySelector<HTMLElement>(
		'button:not([type]), [type="submit"], [type="image"]'
	);
	return convertFormData(new FormData(form, submitter), { strict: false });
}

/**
 * A form action as a `FormSource`. Create it with `actionForm()`.
 * Spread onto a `<form>` (or pass to `<Form form={...}>`), it adds `method`, `action` and an
 * attachment that runs `use:enhance`.
 */
export class ActionForm<Input extends RemoteFormInput, Result> implements FormSource {
	readonly method = 'POST' as const;
	/** `?/name` for a named action. */
	readonly action: string | undefined;
	[attachment: symbol]: Attachment<HTMLFormElement>;

	readonly #schema: StandardSchemaV1;
	readonly #getForm: () => unknown;
	readonly #name: string;

	#input: Record<string, unknown>;
	#clientIssues = $state.raw<KeyedIssue[]>([]);
	/** The `form` a reset dismissed. Kit cannot clear the page's `form`, so it is ignored instead. */
	#dismissed = $state.raw<unknown>(undefined);
	#touched = $state<Record<string, boolean>>({});
	#dirty = $state<Record<string, boolean>>({});
	/** Paths edited and then left, whose issues `validate()` may show before a submit. */
	#canValidate: Record<string, boolean> = {};
	#pending = $state(0);
	#submitted = $state(false);
	#element: HTMLFormElement | null = null;
	#enhance: ActionFormEnhanceCallback<Input, Result> = defaultEnhance;
	#validateId = 0;

	#failure = $derived.by(() => {
		const form = this.#getForm();
		return isFailure(form) && form.action === this.#name && form !== this.#dismissed
			? form
			: undefined;
	});

	/** Server issues from the page's `form`, each replaced by a newer client issue on its path. */
	#issues = $derived.by(() => {
		const client = this.#clientIssues;
		const names = client.map((issue) => issue.name);
		const server = (this.#failure?.issues ?? [])
			.map(normalizeIssue)
			.filter((issue) => !names.includes(issue.name));
		return flattenIssues([...server, ...client]);
	});

	#fields: RemoteForm<Input, Result>['fields'];

	constructor(schema: StandardSchemaV1, getForm: () => unknown, action: string) {
		this.#schema = schema;
		this.#getForm = getForm;
		this.#name = action;
		this.action = action === 'default' ? undefined : `?/${action}`;

		// The echo of a submission made without JavaScript, read once like a remote form's. A
		// snapshot, because edits must not write into the page's `form`, which may be a proxy.
		const form = getForm();
		this.#input = $state(
			isFailure(form) && form.action === action ? ($state.snapshot(form.input) ?? {}) : {}
		);

		const store: FieldStore = {
			get: () => this.#input,
			set: (path, value) => this.#set(path, value),
			issues: () => this.#issues,
			touched: () => this.#touched,
			dirty: () => this.#dirty
		};
		this.#fields = createFieldProxy(store) as RemoteForm<Input, Result>['fields'];

		Object.defineProperty(this, createAttachmentKey(), {
			value: this.#attach,
			enumerable: true
		});
	}

	/** Field handles by path, typed by the schema's input: `f.fields.email`. */
	get fields(): RemoteForm<Input, Result>['fields'] {
		return this.#fields;
	}

	/**
	 * What the action returned on success, read from the page's `form`. A page has one `form`,
	 * so with several `actionForm`s on a page this is the last successful action's result,
	 * whichever form sent it. Failures are kept apart by action name, successes are not.
	 */
	get result(): Result | undefined {
		const form = this.#getForm();
		return form != null && !isFailure(form) ? (form as Result) : undefined;
	}

	/** Submits in flight, client validation included. */
	get pending(): number {
		return this.#pending;
	}

	/** True after a submit attempt, until the form resets. */
	get submitted(): boolean {
		return this.#submitted;
	}

	/**
	 * Runs the schema on the form's current values. Issues on fields that were not edited and
	 * left stay hidden unless `all` is set or the form was submitted. Actions have no
	 * validate-only request, so this is always client-side, as with `preflightOnly`.
	 */
	async validate({ all = false }: { all?: boolean; preflightOnly?: boolean } = {}) {
		const id = ++this.#validateId;
		// `set()` right before `validate()` needs a tick to reach the DOM.
		await tick();
		if (!this.#element) return;
		const result = await this.#schema['~standard'].validate(readForm(this.#element));
		if (id !== this.#validateId) return;
		let issues = (result.issues ?? []).map(normalizeIssue);
		if (!all && !this.#submitted) issues = issues.filter((issue) => this.#canValidate[issue.name]);
		this.#clientIssues = issues;
	}

	/**
	 * Replaces what happens once a submit passes the schema. The callback runs before the
	 * request: nothing is sent unless it calls `submit()`.
	 */
	enhance(callback: ActionFormEnhanceCallback<Input, Result>): this {
		this.#enhance = callback;
		return this;
	}

	#set(path: Path, value: unknown) {
		if (path.length === 0) {
			this.#input = value as Record<string, unknown>;
			return;
		}
		if (value === deepGet(this.#input, path)) return;
		deepSet(this.#input, path.map(String), value);
		if (!this.#element) return;
		const key = pathKey(path);
		this.#touched[key] = true;
		this.#dirty[key] = true;
		this.#canValidate[key] = true;
	}

	async #preflight(formData: FormData): Promise<boolean> {
		const result = await this.#schema['~standard'].validate(
			convertFormData(formData, { strict: false })
		);
		this.#clientIssues = (result.issues ?? []).map(normalizeIssue);
		return !result.issues;
	}

	#submit: SubmitFunction = async ({ formData, formElement, cancel }) => {
		this.#submitted = true;
		this.#pending++;
		let valid = false;
		try {
			valid = await this.#preflight(formData);
		} finally {
			if (!valid) {
				this.#pending--;
				cancel();
			}
		}
		if (!valid) return;

		let requested = false;
		let request!: (send: boolean) => void;
		const sent = new Promise<boolean>((resolve) => (request = resolve));
		let respond!: (response: { result: ActionResult; update: Update }) => void;
		const response = new Promise<{ result: ActionResult; update: Update }>(
			(resolve) => (respond = resolve)
		);

		let refreshAll: boolean | undefined;
		const applied = response.then(async ({ result, update }) => {
			// The DOM keeps what the user typed while the request was in flight.
			await update({ reset: false, refreshAll });
			// Like a remote form, the server's answer replaces every client issue, so Form can
			// tell server issues apart by when they arrived.
			this.#clientIssues = [];
			return result.type === 'success' || result.type === 'redirect';
		});
		const submission: ActionFormSubmission = Object.assign(applied, {
			updates: () => {
				refreshAll = false;
				return submission;
			}
		});

		const instance = enhanceInstance(this, formElement, () => {
			if (!requested) {
				requested = true;
				request(true);
			}
			return submission;
		});

		const done = (async () => {
			try {
				await this.#enhance(instance);
			} finally {
				request(false);
				this.#pending--;
			}
		})();

		if (!(await sent)) {
			cancel();
			await done;
			return;
		}
		return async ({ result, update }) => {
			respond({ result, update });
			await done;
		};
	};

	#attach = (form: HTMLFormElement) => {
		this.#element = form;
		this.#touched = {};
		this.#dirty = {};
		this.#canValidate = {};

		const enhanced = kitEnhance(form, this.#submit);

		const stopInput = on(form, 'input', (event) => {
			const element = event.target as HTMLInputElement;
			if (!element.name) return;
			const field = parseFormKey(element.name);
			let keys: string[];
			try {
				keys = splitPath(field.name);
				this.#write(form, element, field, keys);
			} catch (error) {
				if (error instanceof FormDataError) return;
				throw error;
			}
			this.#dirty[field.name] = true;
		});

		const stopFocusOut = on(form, 'focusout', (event) => {
			const name = (event.target as HTMLInputElement).name;
			if (!name) return;
			const field = parseFormKey(name);
			this.#touched[field.name] = true;
			if (Object.hasOwn(this.#dirty, field.name)) this.#canValidate[field.name] = true;
		});

		// A reset button resets the inputs a task after the `reset` event, so read them then.
		const stopReset = onFormReset(form, {
			settle: () => {
				this.#dismissed = this.#getForm();
				this.#input = readForm(form);
				this.#clientIssues = [];
				this.#touched = {};
				this.#dirty = {};
				this.#canValidate = {};
				this.#submitted = false;
			}
		});

		return () => {
			enhanced.destroy();
			stopInput();
			stopFocusOut();
			stopReset();
			if (this.#element === form) this.#element = null;
		};
	};

	/** Kit's input handler: the edited control's value, coerced by its name, into the input. */
	#write(
		form: HTMLFormElement,
		element: HTMLInputElement,
		field: ReturnType<typeof parseFormKey>,
		keys: string[]
	) {
		const isFile = element.type === 'file';
		if (field.isArray) {
			let value: unknown[];
			if (element.tagName === 'SELECT') {
				value = Array.from(
					element.querySelectorAll<HTMLOptionElement>('option:checked'),
					(option) => option.value
				);
			} else {
				const elements = Array.from(
					form.querySelectorAll<HTMLInputElement>(`[name="${CSS.escape(element.name)}"]`)
				);
				value = isFile
					? elements.flatMap((input) => Array.from(input.files ?? []))
					: elements.map((input) => input.value);
				if (element.type === 'checkbox') value = value.filter((_, i) => elements[i].checked);
			}
			deepSet(this.#input, keys, isFile ? value : coerceFormValue(field.type, value));
		} else if (isFile) {
			const file = element.files?.[0];
			deepSet(this.#input, keys, file ?? DELETE_KEY);
		} else {
			const value = element.type === 'checkbox' && !element.checked ? null : element.value;
			deepSet(this.#input, keys, coerceFormValue(field.type, value));
		}
	}
}

type Update = Parameters<Exclude<Awaited<ReturnType<SubmitFunction>>, void>>[0]['update'];

/**
 * A form action as a `FormSource`, shaped like a remote form: `fields`, `pending`,
 * `submitted`, `result`, `validate()` and `enhance()`.
 *
 * Pass the page's `form` prop as a getter, `actionForm(schema, () => form)`, so issues, the
 * echoed input and the result follow it, with or without JavaScript. The schema runs before
 * each submit, and only a valid submit reaches the server. Return `submission.fail()` from
 * `parseForm` in the action to send issues back.
 *
 * Several forms on one page each pass `{ action: 'name' }` for their named action and read
 * only that action's failures.
 */
export function actionForm<
	Schema extends StandardSchemaV1<RemoteFormInput, Record<string, unknown>>,
	F
>(
	schema: FormSchema<Schema>,
	getForm: () => F,
	options: { action?: string } = {}
): ActionForm<Extract<StandardSchemaV1.InferInput<Schema>, RemoteFormInput>, ActionResultOf<F>> {
	return new ActionForm(schema as Schema, getForm, options.action ?? 'default');
}
