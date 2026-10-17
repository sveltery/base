import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoAnimatedPopoverSvelteTransitionKeepMountedFalse = createDemoWithVariants(
	import.meta.url,
	{ Tailwind }
);
