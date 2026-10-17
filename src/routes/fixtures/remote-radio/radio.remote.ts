import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import * as v from 'valibot';

import { plans } from './plans.js';

// The server rejects `free`, so a test can see an issue come back and clear.
export const planForm = form(v.object({ plan: v.picklist(plans) }), (data, issue) => {
	if (data.plan === 'free') invalid(issue.plan('The free plan is full'));
	return { received: data };
});
