<script lang="ts">
	import { untrack } from 'svelte';
	import { createControllableValue } from '../lib/internal/controllable-value.svelte.js';

	let { mode = 'bind' }: { mode?: 'bind' | 'reject' | 'flip' | 'clear' | 'lower' } = $props();

	const startsEmpty = untrack(() => mode === 'bind');
	let prop = $state<string | undefined>(startsEmpty ? undefined : 'a');
	let log = $state<string[]>([]);

	const controllable = createControllableValue<string>({
		getProp: () => prop,
		setProp: (next) => {
			if (mode === 'reject') return;
			prop = mode === 'lower' && typeof next === 'string' ? next.toLowerCase() : next;
		},
		getDefault: () => 'fallback',
		onChange(next) {
			log = [...log, String(next)];
		}
	});
</script>

<output data-testid="value">{controllable.value ?? 'none'}</output>
<output data-testid="prop">{prop ?? 'none'}</output>
<output data-testid="log">{JSON.stringify(log)}</output>
<button type="button" data-testid="set-b" onclick={() => controllable.set('b')}>Set b</button>
<button type="button" data-testid="set-mixed" onclick={() => controllable.set('Ab')}
	>Set mixed</button
>
<button
	type="button"
	data-testid="flip"
	onclick={() => {
		controllable.set('b');
		controllable.set('a');
	}}
>
	Flip
</button>
<button type="button" data-testid="parent-c" onclick={() => (prop = 'c')}>Parent c</button>
<button type="button" data-testid="clear" onclick={() => (prop = undefined)}>Clear</button>
