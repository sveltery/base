import { writeFileSync } from 'node:fs';
import { render } from 'svelte/server';
import Consumer from './DOMConsumer.svelte';
const { body } = render(Consumer);
writeFileSync(new URL('./hydration-seed.json', import.meta.url), JSON.stringify({ body }));
