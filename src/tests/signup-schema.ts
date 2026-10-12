// A Standard Schema written by hand, so form specs need no validation library.
import type { StandardSchemaV1 } from '@standard-schema/spec';

export interface SignupInput {
	email: string;
	name: string;
	age: number;
	tags?: string[];
	agree?: boolean;
	_password?: string;
	address?: { city?: string; _note?: string };
}

export type SignupOutput = SignupInput;

/** `email` needs an `@`, `name` is required, `age` is a number of at least 18. */
export const signupSchema: StandardSchemaV1<SignupInput, SignupOutput> = {
	'~standard': {
		version: 1,
		vendor: 'sveltery-test',
		validate(value) {
			const input = value as Record<string, unknown>;
			const issues: StandardSchemaV1.Issue[] = [];
			if (typeof input.email !== 'string' || !input.email.includes('@')) {
				issues.push({ message: 'Invalid email', path: ['email'] });
			}
			if (typeof input.name !== 'string' || input.name === '') {
				issues.push({ message: 'Name is required', path: ['name'] });
			}
			if (typeof input.age !== 'number' || Number.isNaN(input.age)) {
				issues.push({ message: 'Age must be a number', path: ['age'] });
			} else if (input.age < 18) {
				issues.push({ message: 'At least 18', path: [{ key: 'age' }] });
			}
			return issues.length ? { issues } : { value: input as unknown as SignupOutput };
		}
	}
};
