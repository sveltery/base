<!-- expect-error: Type '"range"' is not assignable to type 'undefined' -->
<!-- Select.Root declares `type?: never`, so a spread of an input kind is a type error. -->
<script lang="ts">
	import type { RemoteForm } from '$app/server';
	import { Select } from '#lib';

	const f = {} as RemoteForm<{ volume: number }, unknown>;
</script>

<Select.Root {...f.fields.volume.as('range')}></Select.Root>
