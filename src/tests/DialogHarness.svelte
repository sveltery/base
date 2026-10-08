<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import DialogFixture from '../routes/fixtures/dialog/DialogFixture.svelte';

	let props: ComponentProps<typeof DialogFixture> = $props();
</script>

<DialogFixture {...props} />
