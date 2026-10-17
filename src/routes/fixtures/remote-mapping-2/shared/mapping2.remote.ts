import { command, form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';
import { check } from './validate.js';
import { profileRules, profileSchema, signupRules, signupSchema } from './schemas.js';

// Directions A and B: Base's Form hands over its values, and the server answers with errors
// keyed by the plain field names.
export const saveSignup = command('unchecked', (values: v.InferInput<typeof signupSchema>) =>
	check(signupSchema, signupRules, values)
);
export const saveProfile = command('unchecked', (values: v.InferInput<typeof profileSchema>) =>
	check(profileSchema, profileRules, values)
);

// Direction C: Kit's remote form, which needs its own names and works without JS.
const kitProfile = v.object({
	...profileSchema.entries,
	agree: v.optional(v.boolean(), false),
	toppings: v.optional(v.array(v.string()), [])
});

export const signupForm = form(signupSchema, (data, issue) => {
	const broken = signupRules(data);
	if (broken.email) invalid(issue.email(broken.email));
	return { data };
});

export const profileForm = form(kitProfile, (data, issue) => {
	const broken = profileRules(data);
	const keys = Object.keys(broken) as (keyof typeof broken & keyof typeof issue)[];
	if (keys.length) invalid(...keys.map((key) => issue[key](broken[key]!)));
	return { data };
});
