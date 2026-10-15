import { fail } from '@sveltejs/kit';
import * as v from 'valibot';

const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters'))
});

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const values = { email: String(data.get('email') ?? ''), name: String(data.get('name') ?? '') };
		const result = v.safeParse(signupSchema, values);
		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.issues) {
				const key = v.getDotPath(issue);
				if (key) errors[key] ??= issue.message;
			}
			return fail(400, { values, errors });
		}
		return { welcome: result.output.name };
	}
};
