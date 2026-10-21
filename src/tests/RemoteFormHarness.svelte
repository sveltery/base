<!-- A Form on a stand-in remote form: `fields` answers `allIssues()` and `value()` like Kit's proxy. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import type { RemoteFormIssue } from '../lib/form/types.js';

	let {
		issues = [],
		values = {},
		fieldName = 'email',
		spread
	}: {
		issues?: RemoteFormIssue[];
		values?: Record<string, unknown>;
		fieldName?: string;
		/** Props spread on the control, as a remote form's `.as()` returns them. */
		spread?: Record<string, unknown>;
	} = $props();

	function node(path: (string | number)[]): unknown {
		return new Proxy(
			{},
			{
				get(_, key) {
					if (key === 'allIssues') {
						return () =>
							issues.filter((issue) => path.every((segment, i) => issue.path[i] === segment));
					}
					if (key === 'issues') {
						return () =>
							issues.filter(
								(issue) =>
									issue.path.length === path.length &&
									path.every((segment, i) => issue.path[i] === segment)
							);
					}
					if (key === 'value') return () => values[path.join('.')];
					if (key === 'as') {
						return (type: string) => ({
							name: `${path.join('.')}/form`,
							type,
							value: values[path.join('.')] ?? '',
							'aria-invalid': undefined
						});
					}
					if (typeof key === 'symbol') return undefined;
					return node([...path, /^\d+$/.test(key) ? Number(key) : key]);
				}
			}
		);
	}

	const remote = $derived({
		method: 'POST' as const,
		action: '?/remote=form',
		fields: node([]),
		pending: 0,
		submitted: issues.length > 0
	});
</script>

<Form form={remote}>
	<Form.Error data-testid="form-error" />
	<Field.Root name={fieldName} data-testid="field">
		<Field.Label data-testid="label">Email</Field.Label>
		<Field.Control data-testid="control" {...spread} />
		<Field.Error data-testid="error" />
	</Field.Root>
</Form>
