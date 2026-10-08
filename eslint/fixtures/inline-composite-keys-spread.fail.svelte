<!-- A nested spread hides the same four arrow keys. -->
<script lang="ts">
	const arrows = [...['ArrowDown', 'ArrowUp'], ...['ArrowLeft', 'ArrowRight']];
</script>

<p>{arrows.length}</p>
