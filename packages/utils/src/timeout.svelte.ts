// Derived from Base UI v1.9.0 packages/utils/src/useTimeout.ts (`useTimeout`) and
// packages/utils/src/useAnimationFrame.ts (`useAnimationFrame`)
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream disposes the timer with `useOnMount`. These register the same cleanup with
// `$effect`, so construct them during component init. Svelte throws `effect_orphan`
// anywhere else. A timer whose owner is not a component is a plain `Timeout` or
// `AnimationFrame` that its owner cancels.

import { AnimationFrame, Interval, Timeout } from './timeout.js';

/** A `Timeout` cleared when the component that created it is destroyed. */
export class ScopedTimeout extends Timeout {
	constructor() {
		super();
		$effect(() => () => this.clear());
	}
}

/** An `AnimationFrame` cancelled when the component that created it is destroyed. */
export class ScopedAnimationFrame extends AnimationFrame {
	constructor() {
		super();
		$effect(() => () => this.cancel());
	}
}

/** An `Interval` cleared when the component that created it is destroyed. */
export class ScopedInterval extends Interval {
	constructor() {
		super();
		$effect(() => () => this.clear());
	}
}
