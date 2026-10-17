import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import CssModules from './css-modules/index.svelte';
import Tailwind from './tailwind/index.svelte';

export const DemoCheckboxBasic = createDemoWithVariants(import.meta.url, { CssModules, Tailwind });
