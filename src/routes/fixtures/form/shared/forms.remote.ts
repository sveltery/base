import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { delay } from './delay.js';
import { CLOSED_EMAIL, CLOSED_MESSAGE, prefsSchema, signupSchema, TAKEN_EMAIL } from './schemas.js';

export const signup = form(signupSchema, async (data, issue) => {
	await delay(300);
	if (data.email === TAKEN_EMAIL) invalid(issue.email('Email already taken'));
	if (data.email === CLOSED_EMAIL) invalid(CLOSED_MESSAGE);
	return { welcome: data.name, age: data.age };
});

export const prefs = form(prefsSchema, async (data) => {
	await delay(150);
	return { saved: data };
});
