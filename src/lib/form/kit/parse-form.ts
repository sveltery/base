// The server half of the form-action integration: decode FormData with Kit's remote-form name
// encoding, validate it with the same Standard Schema, and fail with what `actionForm` reads.
// The issue builder, redaction and action name follow SvelteKit 3.0.1
// (packages/kit/src/runtime/app/server/remote/form.js, src/runtime/server/page/actions.js).
// MIT, see THIRD_PARTY_NOTICES.md.

import type { StandardSchemaV1 } from '@standard-schema/spec';
import { error, fail, type ActionFailure } from '@sveltejs/kit';
import type { RemoteFormInput, RemoteFormInvalidField } from '$app/server';
import type { FormIssue } from '../source.js';
import { convertFormData, FormDataError, normalizeIssue } from './codec.js';

type DeepPartial<T> = T extends Record<PropertyKey, unknown> | unknown[]
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T | undefined;

/** What a failed action returns as `form`. `actionForm` reads it from the page. */
export interface FormFailure<Input = Record<string, unknown>> {
	/** The action that failed: `login` for `?/login`, `default` otherwise. */
	action: string;
	/** The submitted values, minus files and fields whose path has a `_`-prefixed key. */
	input: DeepPartial<Input>;
	issues: FormIssue[];
}

/** An issue to add on `fail()`. A string is an issue on the whole form. */
export type ExtraIssue = StandardSchemaV1.Issue | string;

interface SubmissionBase<Input> {
	/** The action this submission was posted to. */
	action: string;
	/** Builds field issues: `submission.issue.email('Email already taken')`. */
	issue: RemoteFormInvalidField<Input>;
	/** `fail(400, { action, input, issues })`, with the schema's issues and these. */
	fail(...issues: ExtraIssue[]): ActionFailure<FormFailure<Input>>;
}

export type Submission<Input, Output> = SubmissionBase<Input> &
	({ ok: true; data: Output } | { ok: false; data?: never });

type IsAny<T> = 0 extends 1 & T ? true : false;

/** Kit's check: a checkbox sends nothing when unchecked, so a required boolean can never pass. */
type HasNonOptionalBoolean<T> =
	IsAny<T> extends true
		? never
		: [T] extends [boolean]
			? true
			: T extends Array<infer U>
				? HasNonOptionalBoolean<U>
				: T extends Record<string, unknown>
					? { [K in keyof T]: HasNonOptionalBoolean<T[K]> }[keyof T]
					: never;

/** A form schema, or an error message as a type when it has a required boolean. */
export type FormSchema<Schema extends StandardSchemaV1<RemoteFormInput, Record<string, unknown>>> =
	true extends HasNonOptionalBoolean<StandardSchemaV1.InferInput<Schema>>
		? 'Error: All booleans in form schemas must be optional (e.g. `v.optional(v.boolean(), false)`) because checkbox inputs do not send a false value when unchecked.'
		: Schema;

/** Kit's action name for a request URL: the first `?/name` parameter, else `default`. */
export function actionName(url: URL): string {
	for (const [key] of url.searchParams) {
		if (key.startsWith('/')) return key.slice(1);
	}
	return 'default';
}

function issueBuilder(path: (string | number)[] = []): unknown {
	const build = (message: string): StandardSchemaV1.Issue => ({ message, path });
	return new Proxy(build, {
		get: (target, key) => {
			if (typeof key === 'symbol') return (target as unknown as Record<symbol, unknown>)[key];
			return issueBuilder([...path, /^\d+$/.test(key) ? parseInt(key, 10) : key]);
		}
	});
}

/** The decoded input without files and `_`-prefixed keys, at any depth. */
function echo(value: unknown): unknown {
	if (Array.isArray(value)) return value.filter((item) => !(item instanceof File)).map(echo);
	if (value === null || typeof value !== 'object') return value;
	const result: Record<string, unknown> = {};
	for (const [key, item] of Object.entries(value)) {
		if (key.startsWith('_') || item instanceof File) continue;
		result[key] = echo(item);
	}
	return result;
}

/**
 * Decodes a form action's request with Kit's remote-form name encoding (`n:` numbers,
 * `b:` booleans, `[]` arrays) and validates it with `schema`. A name that is not a valid field
 * path, or that could pollute `Object.prototype`, is answered with a 400 error.
 *
 * Pass `options.action` only with FormData, whose action cannot be read from a URL.
 */
export async function parseForm<
	Schema extends StandardSchemaV1<RemoteFormInput, Record<string, unknown>>
>(
	source: Request | FormData,
	schema: FormSchema<Schema>,
	options: { action?: string } = {}
): Promise<Submission<StandardSchemaV1.InferInput<Schema>, StandardSchemaV1.InferOutput<Schema>>> {
	type Input = StandardSchemaV1.InferInput<Schema>;
	const action =
		source instanceof Request ? actionName(new URL(source.url)) : (options.action ?? 'default');
	const formData = source instanceof Request ? await source.formData() : source;

	let data: Record<string, unknown>;
	try {
		data = convertFormData(formData);
	} catch (cause) {
		if (cause instanceof FormDataError) error(400, cause.message);
		throw cause;
	}

	const result = await (schema as Schema)['~standard'].validate(data);
	const schemaIssues = result.issues ?? [];
	const base: SubmissionBase<Input> = {
		action,
		issue: issueBuilder() as RemoteFormInvalidField<Input>,
		fail: (...extra) =>
			fail(400, {
				action,
				input: echo(data) as DeepPartial<Input>,
				issues: [
					...schemaIssues,
					...extra.map((issue) => (typeof issue === 'string' ? { message: issue } : issue))
				].map((issue) => {
					const { path, message } = normalizeIssue(issue);
					return { path, message };
				})
			})
	};
	return result.issues ? { ...base, ok: false } : { ...base, ok: true, data: result.value };
}
