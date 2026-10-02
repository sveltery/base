<script lang="ts">
  let { value, defaultValue, canceled = false }: { value?: string; defaultValue?: string; canceled?: boolean } = $props();
</script>
<form onreset={event => { if (canceled) event.preventDefault(); }}>
  <input {...{ value, defaultValue }} aria-label="Native baseline" />
</form>
