<script lang="ts">
  let { value, defaultValue, canceled = false, resetOnInput = false }: { value?: string; defaultValue?: string; canceled?: boolean; resetOnInput?: boolean } = $props();
</script>
<form onreset={event => { if (canceled) event.preventDefault(); }}>
  <input {...{ value, defaultValue }} oninput={event => { if (resetOnInput) event.currentTarget.form?.reset(); }} aria-label="Native baseline" />
</form>
