<!-- `.split(' ')` of the six composite keys is still an inline copy. -->
<script lang="ts">
	const keys = 'ArrowDown ArrowUp ArrowRight ArrowLeft Home End'.split(' ');
</script>

<p>{keys.join(',')}</p>
