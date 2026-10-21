import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { delay } from './delay.js';
import {
	CLOSED_EMAIL,
	CLOSED_MESSAGE,
	MAX_SEATS,
	orderSchema,
	SEATS_MESSAGE,
	signupSchema,
	TAKEN_EMAIL
} from './schemas.js';

export const signup = form(signupSchema, async (data, issue) => {
	await delay(300);
	if (data.email === TAKEN_EMAIL) invalid(issue.email('Email already taken'));
	if (data.email === CLOSED_EMAIL) invalid(CLOSED_MESSAGE);
	return { welcome: data.name };
});

export const order = form(orderSchema, async (data, issue) => {
	if (data.seats > MAX_SEATS) invalid(issue.seats(SEATS_MESSAGE));
	return data;
});
