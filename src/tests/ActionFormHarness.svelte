<script lang="ts">
	import { untrack } from 'svelte';
	import { actionForm, type ActionFormEnhanceCallback } from '../lib/form/kit/index.js';
	import { server } from './kit-forms-mock.svelte.js';
	import { signupSchema, type SignupInput } from './signup-schema.js';

	let {
		action,
		enhance
	}: {
		action?: string;
		enhance?: ActionFormEnhanceCallback<SignupInput, { welcome: string }>;
	} = $props();

	const f = actionForm(signupSchema, () => server.form as { welcome: string } | undefined, {
		get action() {
			return action;
		}
	});
	// The callback is set once, as an app would set it.
	untrack(() => enhance && f.enhance(enhance));

	const state = $derived({
		pending: f.pending,
		submitted: f.submitted,
		result: f.result ?? null,
		issues: f.fields.allIssues() ?? [],
		email: {
			value: f.fields.email.value() ?? null,
			touched: f.fields.email.touched(),
			dirty: f.fields.email.dirty(),
			issues: f.fields.email.issues() ?? []
		},
		name: { value: f.fields.name.value() ?? null }
	});

	export function source() {
		return f;
	}
</script>

<form {...f} data-testid="form">
	<input {...f.fields.email.as('email')} data-testid="email" />
	<input {...f.fields.name.as('text')} data-testid="name" />
	<input {...f.fields.age.as('number')} data-testid="age" />
	<input {...f.fields.agree.as('checkbox')} data-testid="agree" />
	<input {...f.fields.tags.as('checkbox', 'svelte')} data-testid="tag-svelte" />
	<input {...f.fields.tags.as('checkbox', 'kit')} data-testid="tag-kit" />
	<input {...f.fields._password.as('password')} data-testid="password" />
	<button>Submit</button>
	<button type="reset">Reset</button>
</form>
<pre data-testid="state">{JSON.stringify(state)}</pre>
