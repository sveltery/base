import type { Profile, Signup } from './schemas.js';

// A native post sends strings. Base's `onFormSubmit` sends typed values, so only the no-JS
// path needs these.
export const signupFromFormData = (data: FormData): Signup => ({
	name: String(data.get('name') ?? ''),
	email: String(data.get('email') ?? '')
});

export const profileFromFormData = (data: FormData): Profile => ({
	plan: String(data.get('plan') ?? '') as Profile['plan'],
	country: String(data.get('country') ?? ''),
	toppings: data.getAll('toppings').map(String).filter(Boolean),
	agree: data.get('agree') === 'on',
	age: data.get('age') ? Number(data.get('age')) : (undefined as unknown as number)
});
