import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import * as s from './schemas.js';

// Each handler echoes what it parsed, so a test can check the value and its type.
export const textForm = form(s.textSchema, (data, issue) => {
	if (data.email === 'taken@example.com') invalid(issue.email('Email already taken'));
	return { received: data };
});

export const checkboxForm = form(s.checkboxSchema, (data, issue) => {
	if (!data.agree) invalid(issue.agree('Accept the terms'));
	return { received: data };
});

export const switchForm = form(s.switchSchema, (data, issue) => {
	if (!data.notify) invalid(issue.notify('Turn notifications on'));
	return { received: data };
});

export const numberForm = form(s.numberSchema, (data, issue) => {
	if (data.age < 18) invalid(issue.age('You must be 18 or older'));
	return { received: data };
});

export const radioForm = form(s.radioSchema, (data, issue) => {
	if (data.plan === 'free') invalid(issue.plan('The free plan is full'));
	return { received: data };
});

export const selectForm = form(s.selectSchema, (data, issue) => {
	if (data.country === 'fr') invalid(issue.country('We do not ship to France'));
	return { received: data };
});

export const checkboxGroupForm = form(s.checkboxGroupSchema, (data, issue) => {
	if (data.toppings.includes('olives')) invalid(issue.toppings('Olives are sold out'));
	return { received: data };
});

export const comboboxForm = form(s.comboboxSchema, (data, issue) => {
	if (data.fruit === 'Durian') invalid(issue.fruit('Durian is not allowed'));
	return { received: data };
});

export const sliderForm = form(s.sliderSchema, (data, issue) => {
	if (data.volume > 80) invalid(issue.volume('Keep the volume at 80 or below'));
	return { received: data };
});
