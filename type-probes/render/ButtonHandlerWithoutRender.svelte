<!-- expect-error: Type 'EventTarget & HTMLButtonElement' is missing the following properties from type 'HTMLAnchorElement' -->
<!-- Without `render`, a handler typed for another element does not change Button's host. -->
<script lang="ts">
	import { Button } from '#lib';
</script>

<Button
	onclick={(event: MouseEvent & { currentTarget: HTMLAnchorElement }) => event.currentTarget.href}
/>
