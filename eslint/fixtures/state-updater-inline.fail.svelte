<script lang="ts">
	let ids: string[] = [];
	const id = 'id';
	const setIds = (update: (current: string[]) => string[]) => {
		ids = update(ids);
	};
	setIds((current) => current.concat(id));
</script>
