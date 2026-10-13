import * as v from 'valibot';

export const signupSchema = v.object({
	email: v.pipe(v.string(), v.email('Enter a valid email')),
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters')),
	age: v.pipe(v.number('Enter your age'), v.minValue(18, 'You must be 18 or older'))
});

export const prefsSchema = v.object({
	plan: v.picklist(['free', 'pro', 'team'], 'Pick a plan'),
	tags: v.pipe(v.optional(v.array(v.string()), []), v.minLength(1, 'Pick at least one topic')),
	seats: v.pipe(v.number('Enter a seat count'), v.minValue(1, 'At least one seat')),
	agree: v.pipe(v.optional(v.boolean(), false), v.literal(true, 'Accept the terms')),
	newsletter: v.optional(v.boolean(), false),
	volume: v.pipe(v.number('Pick a volume'), v.maxValue(80, 'Keep the volume at 80 or below'))
});

/** The signup the fixtures' server rejects with an issue on `email`. */
export const TAKEN_EMAIL = 'taken@example.com';
/** The signup the fixtures' server rejects with an issue on the whole form. */
export const CLOSED_EMAIL = 'closed@example.com';
export const CLOSED_MESSAGE = 'Signups are closed for this domain';
