<!-- expect-error: Type '"checkbox"' is not assignable to type '"radio"' -->
<!-- Radio types its input as `type?: 'radio'`, so a checkbox spread is a type error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Radio } from '#lib';

	const f = {} as RemoteForm<{ tos: boolean }, unknown>;
</script>

<Radio.Root {...f.fields.tos.as('checkbox')} />
