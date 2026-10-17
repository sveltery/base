<!-- expect-error: Type 'number' is not assignable to type 'string' -->
<!-- A trigger's payload must match the payload type of the handle it opens. -->
<script lang="ts">
	import { Tooltip } from '#lib';

	const handle = Tooltip.createHandle<{ label: string }>();
</script>

<Tooltip.Trigger {handle} payload={{ label: 1 }} />
