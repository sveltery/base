import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const DemoDrawerSnapPoints = createDemoWithVariants(import.meta.url, { Tailwind });
