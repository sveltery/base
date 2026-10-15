import * as v from 'valibot';

export const schema = v.object({
	email: v.pipe(v.string(), v.email('Invalid email address'))
});
