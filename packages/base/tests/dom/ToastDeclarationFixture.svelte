<script lang="ts">
  import ToastFixture from '../../../../apps/fixtures/src/lib/ToastFixture.svelte';
  let scenario = $state('basic-parts');
  export function setScenario(value: string) {
    scenario = value;
  }
</script>

<ToastFixture {scenario} />
