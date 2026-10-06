// Native lifetime replacement of Base UI useIsHydrating at 47b40521; MIT.
import { onMount } from 'svelte';
/** SSR and hydration share the initial markup; native mounting ends that phase. */
export class HydrationState {
  #isHydrating = $state(true);

  constructor() {
    onMount(() => {
      this.#isHydrating = false;
    });
  }

  readonly read = () => this.#isHydrating;
}
