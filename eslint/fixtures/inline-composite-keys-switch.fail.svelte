<!-- Switch cases hide the same four arrow keys. -->
<script lang="ts">
	function matched(key: string) {
		switch (key) {
			case 'ArrowDown':
			case 'ArrowUp':
			case 'ArrowLeft':
			case 'ArrowRight':
				return true;
			default:
				return false;
		}
	}
</script>

<p>{matched('ArrowDown')}</p>
