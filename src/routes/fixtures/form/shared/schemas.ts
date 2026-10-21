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

/** An order of Select, Slider and NumberField values, each spread or bound. */
export const orderSchema = v.object({
	language: v.picklist(['en', 'fr', 'de']),
	region: v.picklist(['eu', 'us', 'asia']),
	volume: v.number(),
	price: v.tuple([v.number(), v.number()]),
	seats: v.number(),
	guests: v.number()
});

/** Seats above this make the fixtures' server reject the order with an issue on `seats`. */
export const MAX_SEATS = 8;
export const SEATS_MESSAGE = `At most ${MAX_SEATS} seats`;
