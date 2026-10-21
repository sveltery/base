<!-- Scenario 3: no SvelteKit API. Base's own validation, `?mode=` sets validationMode. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Field, Form, type FormValidationMode } from '#lib';
	import { submitTo } from '../../form-log.js';
	import { delay } from '../shared/delay.js';
	import FixturePage from '../shared/FixturePage.svelte';

	const mode = (page.url.searchParams.get('mode') ?? 'onSubmit') as FormValidationMode;
	let submitted = $state<Record<string, unknown> | null>(null);

	async function available(value: unknown) {
		await delay(50);
		return value === 'admin' ? 'Reserved for system use' : null;
	}
</script>

<FixturePage debug={{ submitted }}>
	<Form validationMode={mode} onsubmit={submitTo((values) => (submitted = values))}>
		<Field.Root
			name="username"
			validate={available}
			validationDebounceTime={100}
			data-field="username"
		>
			<Field.Label>Username</Field.Label>
			<Field.Control required minlength={3} />
			<Field.Error data-testid="error" />
		</Field.Root>
		<Field.Root name="website" data-field="website">
			<Field.Label>Website</Field.Label>
			<Field.Control type="url" pattern="https://.*" />
			<Field.Error data-testid="error" match="patternMismatch">Use an https:// address</Field.Error>
			<Field.Error data-testid="error" match="typeMismatch">Enter a URL</Field.Error>
		</Field.Root>
		<button>Save</button>
		<button type="reset">Reset</button>
	</Form>
</FixturePage>
