import { fail } from '@sveltejs/kit';
import { signupFromFormData } from '../../shared/form-data.js';
import { signupRules, signupSchema } from '../../shared/schemas.js';
import { check } from '../../shared/validate.js';

export const actions = {
	default: async ({ request }) => {
		const values = signupFromFormData(await request.formData());
		const outcome = check(signupSchema, signupRules, values);
		if (outcome.errors) return fail(400, { errors: outcome.errors, values });
		return { received: outcome.data };
	}
};
