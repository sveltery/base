// Draws the Open Graph image of each route group, as Base UI's `(docs)` and `(website)` folders
// each hold an `opengraph-image.png`. Run from apps/docs: node scripts/og-image.ts
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const font = readFileSync(
	new URL('../static/fonts/instrument-sans-regular.woff2', import.meta.url)
);

const html = `<!doctype html>
<style>
	@font-face {
		font-family: 'Instrument Sans';
		src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');
	}
	body {
		margin: 0;
		width: 1200px;
		height: 630px;
		background: black;
		color: oklch(90% 0.5% 264);
		font-family: 'Instrument Sans';
		display: grid;
		place-items: center;
		background-image:
			linear-gradient(to right, transparent 95px, #555 95px 96px, transparent 96px 1104px, #555 1104px 1105px, transparent 1105px),
			linear-gradient(to bottom, transparent 95px, #555 95px 96px, transparent 96px 534px, #555 534px 535px, transparent 535px);
	}
	div { display: flex; align-items: center; gap: 28px; font-size: 96px; letter-spacing: -0.03em; }
</style>
<div>
	<svg width="88" height="88" viewBox="0 0 32 32">
		<rect width="32" height="32" rx="7" fill="currentColor" />
		<path d="M10 11h12M10 16h8M10 21h12" stroke="black" stroke-width="2.5" stroke-linecap="round" />
	</svg>
	sveltery base
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
for (const group of ['docs', 'website']) {
	await page.screenshot({ path: new URL(`../static/og/${group}.png`, import.meta.url).pathname });
}
await browser.close();
