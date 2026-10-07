<script lang="ts">
	let value: unknown = undefined;
	let name = '';
	const formContext = { clearErrors(_name: string) {} };
	const field = { change(_next: unknown) {}, setDirty(_dirty: boolean) {} };

	function commit(next: unknown) {
		if (Object.is(next, value)) return;
		value = next;
		formContext.clearErrors(name);
		field.setDirty(true);
		field.change(next);
	}

	const rendered = true;
	let message: string | null = 'Required';
	let frozen: string | null = null;
	const visibleMessage = $derived(rendered ? message : frozen);

	function capture(current: string | null) {
		frozen = current;
	}

	const node: { previousElementSibling: Element | null } = { previousElementSibling: null };
	$effect(() => {
		const sibling = node.previousElementSibling;
		if (sibling) capture(sibling.textContent);
	});
</script>

<button type="button" onclick={() => commit(value)}>{visibleMessage}</button>
