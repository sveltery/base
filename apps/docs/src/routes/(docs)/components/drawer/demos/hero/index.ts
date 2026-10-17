import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoDrawerHero = createDemoWithVariants(import.meta.url, { Tailwind });
