/** Form `errors` for one field: Kit's issues under the field's `.as()` name, or nothing. */
export function errorsFor(name: string, issues: { message: string }[] | undefined) {
	return issues ? { [name]: issues.map((issue) => issue.message) } : {};
}
