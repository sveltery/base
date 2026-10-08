<!-- An === chain hides the same four arrow keys. -->
<script lang="ts">
	const key = 'ArrowDown';
	const matched =
		key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowLeft' || key === 'ArrowRight';
</script>

<p>{matched}</p>
