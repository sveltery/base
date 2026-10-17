import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoDirectionProviderHero = createDemoWithVariants(import.meta.url, { Tailwind });
