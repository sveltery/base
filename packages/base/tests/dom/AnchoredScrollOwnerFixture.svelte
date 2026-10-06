<script lang="ts">
  import { useAnchoredPopupScrollLock } from '../../src/lib/utils/useAnchoredPopupScrollLock.svelte.js';

  let enabled = $state(true);
  let touchOpen = $state(true);
  let positionerElement = $state<HTMLElement | null>(null);
  let referenceElement = $state<Element | null>(null);
  useAnchoredPopupScrollLock(
    () => enabled,
    () => touchOpen,
    () => positionerElement,
    () => referenceElement,
  );

  export function configure(
    nextEnabled: boolean,
    nextTouchOpen: boolean,
    nextPositionerElement: HTMLElement | null,
    nextReferenceElement: Element | null = nextPositionerElement,
  ) {
    enabled = nextEnabled;
    touchOpen = nextTouchOpen;
    positionerElement = nextPositionerElement;
    referenceElement = nextReferenceElement;
  }
</script>
