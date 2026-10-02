<script lang="ts">
  import Fixture from '../../lib/ToastPortalFixture.svelte';
  let { data } = $props();
</script>
<Fixture scenario={data.scenario} />
