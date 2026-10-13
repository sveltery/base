import { parseForm } from '#lib/form/kit/index.js';
import { delay } from '../shared/delay.js';
import { CLOSED_EMAIL, CLOSED_MESSAGE, signupSchema, TAKEN_EMAIL } from '../shared/schemas.js';

export const actions = {
	default: async ({ request }) => {
		const submission = await parseForm(request, signupSchema);
		if (!submission.ok) return submission.fail();
		await delay(300);
		if (submission.data.email === TAKEN_EMAIL) {
			return submission.fail(submission.issue.email('Email already taken'));
		}
		if (submission.data.email === CLOSED_EMAIL) return submission.fail(CLOSED_MESSAGE);
		return { welcome: submission.data.name };
	}
};
