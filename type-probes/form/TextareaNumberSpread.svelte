<!-- expect-error: Type '"number"' is not assignable to type 'undefined' -->
<!-- Textarea declares `type?: never`, so a number spread is a type error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Textarea } from '#lib';

	const f = {} as RemoteForm<{ age: number }, unknown>;
</script>

<Textarea {...f.fields.age.as('number')} />
