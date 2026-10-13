<script lang="ts">
	import { getToastManager, type ToastManager } from '#lib';

	let { globalManager, log }: { globalManager: ToastManager; log: (entry: string) => void } =
		$props();

	const manager = getToastManager();

	let count = 0;
	let lastId = '';
	let anchor = $state<HTMLButtonElement | null>(null);
	let pending: { resolve: (value: string) => void; reject: (error: Error) => void } | undefined;

	function closeLogger(title: string) {
		return () => log(`close:${title}`);
	}

	function add() {
		count += 1;
		const title = `Toast ${count}`;
		lastId = manager.add({
			title,
			description: `Description ${count}`,
			onClose: closeLogger(title),
			onRemove: () => log(`remove:${title}`)
		});
	}

	function addGlobal() {
		count += 1;
		const title = `Global ${count}`;
		lastId = globalManager.add({
			title,
			description: `Description ${count}`,
			onClose: closeLogger(title)
		});
	}

	function addWithAction() {
		count += 1;
		const title = `Toast ${count}`;
		lastId = manager.add({
			title,
			description: `Description ${count}`,
			onClose: closeLogger(title),
			actionProps: { children: 'Undo', onclick: () => log(`action:${title}`) }
		});
	}

	function addHigh() {
		count += 1;
		const title = `Urgent ${count}`;
		lastId = manager.add({
			title,
			description: `Description ${count}`,
			priority: 'high',
			onClose: closeLogger(title)
		});
	}

	function addAnchored() {
		count += 1;
		const title = `Copied ${count}`;
		lastId = manager.add({
			title,
			description: 'Copied to clipboard',
			positionerProps: { anchor, sideOffset: 10 },
			onClose: closeLogger(title)
		});
	}

	function updateLast() {
		manager.update(lastId, { title: 'Updated', description: 'Updated description', type: 'info' });
	}

	function startPromise() {
		const promise = new Promise<string>((resolve, reject) => {
			pending = { resolve, reject };
		});
		manager
			.promise(promise, {
				loading: { title: 'Saving', description: 'Please wait' },
				success: (result) => ({ title: 'Saved', description: result }),
				error: (error: Error) => ({ title: 'Failed', description: error.message })
			})
			.catch(() => {});
	}
</script>

<button type="button" data-testid="add" onclick={add}>Add</button>
<button type="button" data-testid="add-global" onclick={addGlobal}>Add global</button>
<button type="button" data-testid="add-action" onclick={addWithAction}>Add action</button>
<button type="button" data-testid="add-high" onclick={addHigh}>Add high</button>
<button type="button" data-testid="add-anchored" onclick={addAnchored}>Add anchored</button>
<button type="button" data-testid="update" onclick={updateLast}>Update</button>
<button type="button" data-testid="promise" onclick={startPromise}>Promise</button>
<button type="button" data-testid="resolve" onclick={() => pending?.resolve('All good')}>
	Resolve
</button>
<button type="button" data-testid="reject" onclick={() => pending?.reject(new Error('Went wrong'))}>
	Reject
</button>
<button type="button" data-testid="close-all" onclick={() => manager.close()}>Close all</button>
<button type="button" data-testid="close-global" onclick={() => globalManager.close()}>
	Close global
</button>
<button
	type="button"
	data-testid="anchor"
	style="position: absolute; top: 300px; left: 200px"
	bind:this={anchor}
>
	Anchor
</button>
