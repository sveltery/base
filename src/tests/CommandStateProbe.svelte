<script lang="ts">
	import { getCommandState } from '#lib';

	const command = getCommandState();
</script>

<output data-testid="state"
	>{command.search}|{command.value}|{command.count}|{command.selectedId ?? ''}</output
>
