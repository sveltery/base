import { fail } from '@sveltejs/kit';
import { profileFromFormData } from '../../shared/form-data.js';
import { profileRules, profileSchema } from '../../shared/schemas.js';
import { check } from '../../shared/validate.js';

export const actions = {
	default: async ({ request }) => {
		const values = profileFromFormData(await request.formData());
		const outcome = check(profileSchema, profileRules, values);
		if (outcome.errors) return fail(400, { errors: outcome.errors, values });
		return { received: outcome.data };
	}
};
