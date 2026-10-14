<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		DEFAULT_FIELD_ROOT_CONTEXT,
		setFieldContext
	} from '../lib/internal/field-root-context.js';

	let { children }: { children: Snippet } = $props();

	setFieldContext(DEFAULT_FIELD_ROOT_CONTEXT);
</script>

{@render children()}
