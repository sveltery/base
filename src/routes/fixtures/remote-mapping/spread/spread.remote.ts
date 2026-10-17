import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';

// The controls round 1's `mapping.remote.ts` has no form for. Each echoes what it parsed.
export const autocompleteForm = form(v.object({ fruit: v.string() }), (data, issue) => {
	if (data.fruit === 'Durian') invalid(issue.fruit('Durian is not allowed'));
	return { received: data };
});

export const otpForm = form(v.object({ code: v.string() }), (data, issue) => {
	if (data.code === '000000') invalid(issue.code('That code has expired'));
	return { received: data };
});
