<script lang="ts">
	import { untrack } from 'svelte';
	import { createControllableValue } from '../lib/internal/controllable-value.svelte.js';

	let { mode = 'bind' }: { mode?: 'bind' | 'reject' | 'flip' | 'clear' | 'lower' | 'proxy' } =
		$props();

	const startsEmpty = untrack(() => mode === 'bind' || mode === 'proxy');
	let prop = $state<string | { id: number } | undefined>(startsEmpty ? undefined : 'a');
	let items = $state([{ id: 1 }, { id: 2 }]);
	let runs = $state(0);
	let log = $state<string[]>([]);

	$effect(() => {
		if (mode !== 'proxy') return;
		for (const item of items) {
			for (const key in item) {
				void item[key as keyof typeof item];
			}
		}
		untrack(() => {
			runs += 1;
		});
	});

	const controllable = createControllableValue<string | { id: number }>({
		getProp: () => prop,
		setProp: (next) => {
			if (mode === 'reject') return;
			if (mode === 'proxy' && next != null && typeof next === 'object') {
				prop = { id: next.id };
				return;
			}
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
<output data-testid="runs">{runs}</output>
<button type="button" data-testid="set-b" onclick={() => controllable.set('b')}>Set b</button>
<button type="button" data-testid="set-mixed" onclick={() => controllable.set('Ab')}
	>Set mixed</button
>
<button type="button" data-testid="set-proxy" onclick={() => controllable.set(items[1])}>
	Set proxy
</button>
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
