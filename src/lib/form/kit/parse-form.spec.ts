import { isActionFailure, isHttpError } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { signupSchema } from '../../../tests/signup-schema.js';
import { parseForm } from './parse-form.js';

function post(url: string, entries: [string, string | File][], headers?: HeadersInit) {
	const body = new FormData();
	for (const [key, value] of entries) body.append(key, value);
	return new Request(url, { method: 'POST', body, headers });
}

const valid: [string, string][] = [
	['email', 'ada@example.com'],
	['name', 'Ada'],
	['n:age', '36'],
	['tags[]', 'svelte'],
	['tags[]', 'kit'],
	['b:agree', 'on']
];

async function rejection(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (error) {
		return error;
	}
	throw new Error('expected a rejection');
}

describe('parseForm', () => {
	it('decodes and validates a valid submission', async () => {
		const submission = await parseForm(post('http://localhost/signup', valid), signupSchema);
		expect(submission.ok).toBe(true);
		expect(submission.data).toEqual({
			email: 'ada@example.com',
			name: 'Ada',
			age: 36,
			tags: ['svelte', 'kit'],
			agree: true
		});
		expect(submission.action).toBe('default');
	});

	it('fails with the schema issues, the echoed input and the action', async () => {
		const submission = await parseForm(
			post('http://localhost/signup?/register', [
				['email', 'nope'],
				['name', ''],
				['n:age', '12']
			]),
			signupSchema
		);
		expect(submission.ok).toBe(false);
		const failure = submission.fail();
		expect(isActionFailure(failure)).toBe(true);
		expect(failure.status).toBe(400);
		expect(failure.data).toEqual({
			action: 'register',
			input: { email: 'nope', name: '', age: 12 },
			issues: [
				{ path: ['email'], message: 'Invalid email' },
				{ path: ['name'], message: 'Name is required' },
				{ path: ['age'], message: 'At least 18' }
			]
		});
	});

	it('does not echo the input of a request sent by use:enhance', async () => {
		const submission = await parseForm(
			post('http://localhost/signup?/register', [['email', 'nope']], {
				'x-sveltekit-action': 'true'
			}),
			signupSchema
		);
		expect(submission.fail().data).toEqual({
			action: 'register',
			issues: [
				{ path: ['email'], message: 'Invalid email' },
				{ path: ['name'], message: 'Name is required' },
				{ path: ['age'], message: 'Age must be a number' }
			]
		});
	});

	it('adds field and form issues from the action', async () => {
		const submission = await parseForm(
			post('http://localhost/signup?/register&next=%2F', valid),
			signupSchema
		);
		expect(submission.ok).toBe(true);
		const failure = submission.fail(
			submission.issue.email('Email already taken'),
			submission.issue.address.city('Unknown city'),
			'Try again later'
		);
		expect(failure.data.action).toBe('register');
		expect(failure.data.issues).toEqual([
			{ path: ['email'], message: 'Email already taken' },
			{ path: ['address', 'city'], message: 'Unknown city' },
			{ path: [], message: 'Try again later' }
		]);
	});

	it('never echoes `_` keys or files, at any depth', async () => {
		const submission = await parseForm(
			post('http://localhost/signup', [
				['email', 'nope'],
				['_password', 'hunter2'],
				['address.city', 'Oslo'],
				['address._note', 'private'],
				['avatar', new File(['x'], 'a.png')],
				['docs[]', new File(['y'], 'b.pdf')],
				['docs[]', 'kept']
			]),
			signupSchema
		);
		expect(submission.fail().data.input).toEqual({
			email: 'nope',
			address: { city: 'Oslo' },
			docs: ['kept']
		});
	});

	it('answers a prototype-polluting name with a 400 and leaves Object.prototype alone', async () => {
		const error = await rejection(
			parseForm(
				post('http://localhost/signup', [['__proto__.polluted', 'yes'], ...valid]),
				signupSchema
			)
		);
		expect(isHttpError(error, 400)).toBe(true);
		expect((error as { body: { message: string } }).body.message).toBe(
			'Invalid key `__proto__`: This key is not allowed to prevent prototype pollution'
		);
		expect(({} as Record<string, unknown>).polluted).toBe(undefined);
	});

	it('answers a name that is not a field path with a 400', async () => {
		const error = await rejection(
			parseForm(
				post('http://localhost/signup', [['g-recaptcha-response', 't'], ...valid]),
				signupSchema
			)
		);
		expect(isHttpError(error, 400)).toBe(true);
	});

	it('takes the action from options when given FormData', async () => {
		const data = new FormData();
		data.append('email', 'nope');
		expect((await parseForm(data, signupSchema)).fail().data.action).toBe('default');
		expect((await parseForm(data, signupSchema, { action: 'login' })).fail().data.action).toBe(
			'login'
		);
	});
});
