<script lang="ts">
  // Newly authored Source199/native witnesses; zero additional Original credit.
  import { createCompositeList } from '../../src/lib/internals/composite/list/createCompositeList.svelte.js';
  import Item from './CompositeRefRecoveryItem.svelte';
  type Refs = {
    elements: { current: Array<HTMLElement | null> };
    labels: { current: Array<string | null> };
  };
  const first: Refs = { elements: { current: [] }, labels: { current: [] } };
  const second: Refs = { elements: { current: [null, null] }, labels: { current: [null, null] } };
  let useSecond = $state(false);
  let ids = $state(['item']);
  let revision = $state(0);
  let publications = 0;
  new createCompositeList(() => ({
    elementsRef: useSecond ? second.elements : first.elements,
    labelsRef: useSecond ? second.labels : first.labels,
    onMapChange() {
      publications += 1;
    },
  }));
  export function replaceRefs() {
    useSecond = true;
  }
  export function add() {
    ids = ['item', 'other'];
  }
  export function reorder() {
    ids = ['other', 'item'];
  }
  export function updateMetadata() {
    revision += 1;
  }
  export function remove() {
    ids = ['item'];
  }
  export function snapshot() {
    return { first, second, publications };
  }
</script>

{#each ids as id (id)}<Item {id} {revision} />{/each}
