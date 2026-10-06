<script lang="ts">
  import { untrack } from 'svelte';
  import { FloatingRootStore } from '../../src/lib/floating-ui/components/FloatingRootStore.svelte.js';
  import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
  import { useDelayGroup } from '../../src/lib/floating-ui/hooks/useDelayGroup.svelte.js';
  let { closedSecond = false }: { closedSecond?: boolean } = $props();
  const requests: { owner: string; open: boolean; reason: string }[] = [];
  function makeStore(id: string, open = true) {
    return new FloatingRootStore({
      open,
      transitionStatus: undefined,
      referenceElement: null,
      floatingElement: null,
      triggerElements: new PopupTriggerMap(),
      floatingId: id,
      syncOnly: false,
      nested: false,
      onOpenChange(open, details) {
        requests.push({ owner: id, open, reason: details.reason });
      },
    });
  }
  const first = makeStore('one');
  const second = untrack(() => makeStore('two', !closedSecond));
  let useSecond = $state(false);
  const store = $derived(useSecond ? second : first);
  const open = $derived(store.useState('open'));
  const group = useDelayGroup(
    () => store,
    () => ({ open }),
  );
  export function changeId() {
    first.set('floatingId', 'two');
  }
  export function switchStore() {
    useSecond = true;
  }
  export function closeFirst() {
    first.set('open', false);
  }
  export function reopenFirst() {
    first.set('open', true);
  }
  export function read() {
    return {
      activeId: group.activeIdRef.current,
      instant: group.isInstantPhase,
      requests: requests.slice(),
    };
  }
</script>

<output>{group.isInstantPhase ? 'instant' : 'normal'}</output>
