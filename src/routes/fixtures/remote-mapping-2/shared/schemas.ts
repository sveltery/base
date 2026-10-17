import * as v from 'valibot';

// The same two forms for every direction. Each server rejects one value per field.
export const signupSchema = v.object({
	name: v.pipe(v.string(), v.minLength(2, 'Use at least 2 characters')),
	email: v.pipe(v.string(), v.email('Enter a valid email'))
});

export const profileSchema = v.object({
	plan: v.picklist(['free', 'pro'], 'Pick a plan'),
	country: v.string('Pick a country'),
	toppings: v.array(v.string()),
	agree: v.boolean(),
	age: v.number('Enter your age')
});

export type Signup = v.InferOutput<typeof signupSchema>;
export type Profile = v.InferOutput<typeof profileSchema>;

/** The rules only the server knows, as issues keyed by field. */
export function signupRules(data: Signup): Record<string, string> {
	return data.email === 'taken@example.com' ? { email: 'Email already taken' } : {};
}

export function profileRules(data: Profile): Record<string, string> {
	const issues: Record<string, string> = {};
	if (data.plan === 'free') issues.plan = 'The free plan is full';
	if (data.country === 'fr') issues.country = 'We do not ship to France';
	if (data.toppings.includes('olives')) issues.toppings = 'Olives are sold out';
	if (!data.agree) issues.agree = 'Accept the terms';
	if (data.age < 18) issues.age = 'You must be 18 or older';
	return issues;
}
