import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import CssModules from './css-modules/index.svelte';

export const DemoToastDeduplicate = createDemoWithVariants(import.meta.url, { CssModules });
