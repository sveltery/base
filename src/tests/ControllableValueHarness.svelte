<script lang="ts">
	import { untrack } from 'svelte';
	import { createControllableValue } from '../lib/internal/controllable-value.svelte.js';

	let {
		mode = 'bind'
	}: { mode?: 'bind' | 'reject' | 'flip' | 'clear' | 'lower' | 'proxy' | 'plain' } = $props();

	const startsEmpty = untrack(() => mode === 'bind' || mode === 'proxy');
	let prop = $state<string | { id: number } | undefined>(startsEmpty ? undefined : 'a');
	let items = $state([{ id: 1 }, { id: 2 }]);
	let runs = $state(0);
	let iterated = $state('');
	let log = $state<string[]>([]);
	let reasons = $state<string[]>([]);
	const plain = { id: 7 };
	const list = [1, 2];
	class Box {
		id = 3;
	}
	const box = new Box();
	let symbols = $state('0,0,0');
	let copySymbols = $state('');
	let proxyProbe = $state({ n: 1 });
	let proxyThrows = $state('pending');

	$effect(() => {
		untrack(() => {
			const mark = Symbol();
			try {
				Object.defineProperty(proxyProbe, mark, {
					configurable: true,
					writable: false,
					value: true
				});
				Reflect.deleteProperty(proxyProbe, mark);
				proxyThrows = 'accepted';
			} catch {
				proxyThrows = 'threw';
			}
		});
	});

	$effect(() => {
		if (mode !== 'proxy') return;
		const labels: string[] = [];
		for (const item of items) {
			for (const key in item) {
				labels.push(`${key}:${String(item[key as keyof typeof item])}`);
			}
		}
		untrack(() => {
			runs += 1;
			iterated = labels.join(',');
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
			if (mode === 'plain') {
				prop = next;
				return;
			}
			prop = mode === 'lower' && typeof next === 'string' ? next.toLowerCase() : next;
		},
		getDefault: () => 'fallback',
		onChange(next, details) {
			log = [...log, String(next)];
			reasons = [...reasons, details == null ? '' : String(details)];
		}
	});
</script>

<output data-testid="value">{controllable.value ?? 'none'}</output>
<output data-testid="prop">{prop ?? 'none'}</output>
<output data-testid="log">{JSON.stringify(log)}</output>
<output data-testid="reasons">{JSON.stringify(reasons)}</output>
<output data-testid="runs">{runs}</output>
<output data-testid="iterated">{iterated}</output>
<output data-testid="symbols">{symbols}</output>
<output data-testid="copy-symbols">{copySymbols}</output>
<output data-testid="proxy-throws">{proxyThrows}</output>
<output data-testid="same">{controllable.value === plain ? 'yes' : 'no'}</output>
<button type="button" data-testid="announce" onclick={() => controllable.announce('now')}>
	Announce
</button>
<button
	type="button"
	data-testid="announce-then-set"
	onclick={() => {
		controllable.announce('now');
		controllable.set(controllable.value, 'same');
	}}
>
	Announce then set
</button>
<button type="button" data-testid="set-b" onclick={() => controllable.set('b')}>Set b</button>
<button type="button" data-testid="set-b-details" onclick={() => controllable.set('b', 'go')}>
	Set b details
</button>
<button
	type="button"
	data-testid="set-same-details"
	onclick={() => controllable.set(controllable.value, 'same')}
>
	Set same
</button>
<button
	type="button"
	data-testid="round-trip-details"
	onclick={() => {
		controllable.set('b', 'one');
		controllable.set('a', 'two');
	}}
>
	Round trip
</button>
<button
	type="button"
	data-testid="set-then-parent"
	onclick={() => {
		controllable.set('b', 'from-set');
		prop = 'c';
	}}
>
	Set then parent
</button>
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
<button
	type="button"
	data-testid="set-plain"
	onclick={() => {
		const copies: number[] = [];
		for (const item of [plain, list as unknown as { id: number }, box, plain]) {
			controllable.set(item);
			const held = prop;
			copies.push(
				held != null && typeof held === 'object' ? Object.getOwnPropertySymbols(held).length : 0
			);
		}
		symbols = [plain, list, box].map((item) => Object.getOwnPropertySymbols(item).length).join(',');
		copySymbols = copies.join(',');
	}}
>
	Set plain
</button>
