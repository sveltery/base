<script lang="ts">
  import { useRegisteredLabelId } from '../../src/lib/utils/useRegisteredLabelId.svelte.js';
  let id = $state('label-a');
  let registeredId = $state<string | undefined>();
  const registrations: (string | undefined)[] = [];
  const nativeId = $props.id();
  const getId = useRegisteredLabelId(() => id, value => {
    registeredId = typeof value === 'function' ? value(registeredId) : value;
    registrations.push(registeredId);
  }, nativeId);
  export function replaceId() { id = 'label-b'; }
  export function readRegistrations() { return registrations.slice(); }
</script>
<div id={getId()} data-registered-label={registeredId}></div>
