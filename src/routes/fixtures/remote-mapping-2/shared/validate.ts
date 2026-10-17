import * as v from 'valibot';

export type Errors = Record<string, string[]>;
export type Outcome<T> = { errors: Errors; data?: undefined } | { errors?: undefined; data: T };

/**
 * Parses values with the schema, then runs the server rules. Errors come back keyed by the
 * field's plain name, the shape Base UI's Form `errors` takes.
 */
export function check<S extends v.GenericSchema>(
	schema: S,
	rules: (data: v.InferOutput<S>) => Record<string, string>,
	values: unknown
): Outcome<v.InferOutput<S>> {
	const parsed = v.safeParse(schema, values);
	if (!parsed.success) return { errors: v.flatten(parsed.issues).nested as Errors };
	const broken = Object.entries(rules(parsed.output));
	if (broken.length) return { errors: Object.fromEntries(broken.map(([k, m]) => [k, [m]])) };
	return { data: parsed.output };
}
