<script lang="ts">
  import AccordionFixture from '../../lib/AccordionFixture.svelte';
  let { data } = $props();
</script>
<AccordionFixture scenario={data.scenario} />
