<script lang="ts">
  import Fixture from '../../lib/SeparatorFixture.svelte';
  let { data } = $props();
</script>
<Fixture scenario={data.scenario} />
