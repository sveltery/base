<!-- expect-error: Type 'number' is not assignable to type 'string' -->
<!-- A trigger's payload must match the payload type of the handle it opens. -->
<script lang="ts">
	import { PreviewCard } from '#lib';

	const handle = PreviewCard.createHandle<{ href: string }>();
</script>

<PreviewCard.Trigger {handle} payload={{ href: 1 }} />
