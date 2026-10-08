<!-- A regex hides the same four arrow keys. -->
<script lang="ts">
	const arrows = /ArrowDown|ArrowUp|ArrowLeft|ArrowRight/;
</script>

<p>{arrows.test('ArrowDown')}</p>
