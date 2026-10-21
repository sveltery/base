<!-- Forms for the submit gate: cross-field `validate`, a reset, and a remote form's dismissed issues. -->
<script lang="ts">
	import { Field, Form } from '#lib';
	import type { RemoteFormIssue } from '../lib/form/types.js';

	let {
		scenario,
		issues = [],
		pending = 0
	}: {
		scenario: 'cross' | 'reset' | 'remote';
		issues?: RemoteFormIssue[];
		pending?: number;
	} = $props();

	let submits = $state(0);

	function recordSubmit(event: SubmitEvent) {
		submits += 1;
		event.preventDefault();
	}

	function node(path: (string | number)[]): unknown {
		return new Proxy(
			{},
			{
				get(_, key) {
					if (key === 'allIssues') {
						return () =>
							issues
								.filter((issue) => path.every((segment, i) => issue.path[i] === segment))
								.map((issue) => ({ ...issue }));
					}
					if (key === 'as') return (type: string) => ({ name: `${path.join('.')}/form`, type });
					if (typeof key === 'symbol') return undefined;
					return node([...path, key]);
				}
			}
		);
	}

	const remote = $derived({
		method: 'POST' as const,
		action: '?/remote=form',
		fields: node([]),
		pending,
		submitted: true
	});
</script>

{#if scenario === 'remote'}
	<Form data-testid="form" form={remote}>
		<Field.Root name="email">
			<Field.Control data-testid="control" required />
			<Field.Error data-testid="error" />
		</Field.Root>
		<button type="submit">Submit</button>
	</Form>
{:else}
	<Form data-testid="form" onsubmit={recordSubmit}>
		{#if scenario === 'cross'}
			<Field.Root name="password">
				<Field.Control data-testid="password" />
			</Field.Root>
			<Field.Root
				name="confirm"
				validate={(value, values) => (value === values.password ? null : 'Passwords differ')}
			>
				<Field.Control data-testid="confirm" />
				<Field.Error data-testid="error" />
			</Field.Root>
		{:else}
			<Field.Root name="code" validate={(value) => (value ? null : 'Enter a code')}>
				<Field.Control data-testid="control" />
				<Field.Error data-testid="error" />
			</Field.Root>
			<button type="reset">Reset</button>
		{/if}
		<button type="submit">Submit</button>
	</Form>
{/if}
<output data-testid="submits">{submits}</output>
