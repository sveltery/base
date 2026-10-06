<script lang="ts">
  import DialogFixture from '../../lib/DialogFixture.svelte';
  let { data } = $props();
</script>

<DialogFixture {...data} />
