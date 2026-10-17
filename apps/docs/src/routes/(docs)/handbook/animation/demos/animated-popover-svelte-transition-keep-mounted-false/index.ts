import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import CssModules from './css-modules/index.svelte';

export const DemoAnimatedPopoverSvelteTransitionKeepMountedFalse = createDemoWithVariants(
	import.meta.url,
	{ CssModules }
);
