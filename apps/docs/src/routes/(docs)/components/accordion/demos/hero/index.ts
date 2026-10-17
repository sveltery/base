import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoAccordionHero = createDemoWithVariants(import.meta.url, { Tailwind });
