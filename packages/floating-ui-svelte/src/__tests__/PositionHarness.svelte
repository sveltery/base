<script lang="ts">
	import type { Middleware } from '@floating-ui/dom';
	import { FloatingPosition } from '../usePosition.svelte.js';

	let { middleware = [] }: { middleware?: Middleware[] } = $props();

	let active = $state<'a' | 'b'>('a');
	let open = $state(true);

	export function show(next: 'a' | 'b' | null) {
		if (next) active = next;
		open = next !== null;
	}

	let a = $state<HTMLElement | null>(null);
	let b = $state<HTMLElement | null>(null);

	export const position = new FloatingPosition(() => ({
		reference: active === 'a' ? a : b,
		placement: 'bottom',
		strategy: 'fixed',
		middleware,
		open,
		enabled: true,
		autoUpdate: {}
	}));
</script>

<div bind:this={a} style="position: fixed; left: 100px; top: 50px; width: 40px; height: 20px"></div>
<div bind:this={b} style="position: fixed; left: 300px; top: 50px; width: 40px; height: 20px"></div>
<div
	style="position: fixed; left: 0; top: 0; width: 40px; height: 20px"
	{@attach position.floatingProps.attach}
></div>
