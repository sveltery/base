<!-- Fixture the no-inline-composite-keys rule must reject. -->
<script lang="ts">
	const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
</script>

<p>{NAV_KEYS.size}</p>
