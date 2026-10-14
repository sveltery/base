<script lang="ts">
	import { Field } from '../lib/field/index.js';
	import DetachedFieldScope from './DetachedFieldScope.svelte';
</script>

<Field.Root name="email" invalid>
	<Field.Control data-testid="attached" />
	<DetachedFieldScope>
		<Field.Control data-testid="detached" />
	</DetachedFieldScope>
</Field.Root>
