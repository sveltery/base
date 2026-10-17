import * as v from 'valibot';

export const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters'))
});

/** The signup the fixtures' server rejects with an issue on `email`. */
export const TAKEN_EMAIL = 'taken@example.com';
/** The signup the fixtures' server rejects with an issue on the whole form. */
export const CLOSED_EMAIL = 'closed@example.com';
export const CLOSED_MESSAGE = 'Signups are closed for this domain';
