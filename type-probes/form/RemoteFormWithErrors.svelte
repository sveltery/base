<!-- expect-error: Type 'Record<string, string>' is not assignable to type 'undefined' -->
<!-- A remote form brings its own issues, so `errors` is for plain forms only. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Form } from '#lib';

	const f = {} as RemoteForm<{ email: string }, unknown>;
	const errors: Record<string, string> = {};
</script>

<Form form={f} {errors}></Form>
