<script lang="ts">
  import ToastFixture from '../../lib/ToastFixture.svelte';
  let { data } = $props();
</script>

<ToastFixture scenario={data.scenario} />
