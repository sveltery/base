import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoScrollAreaHero = createDemoWithVariants(import.meta.url, { Tailwind });
