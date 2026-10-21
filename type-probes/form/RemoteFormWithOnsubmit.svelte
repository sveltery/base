<!-- expect-error: is not assignable to type 'undefined' -->
<!-- Kit ignores a cancelled submit event, so a remote form takes `f.enhance()` instead of `onsubmit`. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Form } from '#lib';

	const f = {} as RemoteForm<{ email: string }, unknown>;
</script>

<Form form={f} onsubmit={() => {}}></Form>
