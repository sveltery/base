// Diffs the built side nav against Base UI's section index lists at the pinned commit: the order
// and titles of every section's pages. Run `vite build` first.
// Usage, from apps/docs: node scripts/compare-nav.ts
import { readFileSync } from 'node:fs';

const PIN = 'ad7ecda5296b0295b41a51ecb01fce6204acd099';
const SECTIONS = ['overview', 'handbook', 'components', 'utils'];
// Base UI's `getDisplayTitle` maps "About Base UI", written with a no-break space, to "About".
const rename = (title: string) => (title === 'About Base\u00a0UI' ? 'About' : title);

const upstream = new Map<string, string[]>();
for (const section of SECTIONS) {
	const url = `https://raw.githubusercontent.com/mui/base-ui/${PIN}/docs/src/app/(docs)/react/${section}/page.mdx`;
	const source = await (await fetch(url)).text();
	const list = source.slice(0, source.indexOf('DO NOT EDIT AFTER THIS LINE'));
	const titles = [...list.matchAll(/^- (?:\[(.+?)\]\(.+?\)|(.+?) - \(\[Outline\])/gm)].map(
		([, link, title]) => rename((link ?? title).replace(/\s*\[[^\]]+\]/g, ''))
	);
	upstream.set(section[0].toUpperCase() + section.slice(1), titles);
}

const html = readFileSync(
	new URL('../.svelte-kit/output/prerendered/pages/overview/quick-start.html', import.meta.url),
	'utf8'
);
const nav = html.slice(html.indexOf('class="SideNavRoot'), html.indexOf('class="SideNavSeparator'));
const ours = new Map<string, string[]>();
for (const [, heading, body] of nav.matchAll(
	/class="SideNavHeading[^"]*">([^<]+)<\/div>([\s\S]*?)<\/ul>/g
)) {
	ours.set(
		heading,
		[...body.matchAll(/class="SideNavLink[^"]*"[^>]*>([^<]+)/g)].map(([, title]) => title.trim())
	);
}

let differences = 0;
for (const [section, titles] of upstream) {
	const built = ours.get(section) ?? [];
	console.log(`\n${section}`);
	// Walks both lists in order. A title only one side has prints as - (Base UI) or + (ours).
	let i = 0;
	let j = 0;
	while (i < titles.length || j < built.length) {
		if (titles[i] === built[j]) {
			console.log(`  = ${titles[i]}`);
			i++;
			j++;
		} else if (i < titles.length && !built.slice(j).includes(titles[i])) {
			console.log(`  - ${titles[i++]}`);
			differences++;
		} else {
			console.log(`  + ${built[j++]}`);
			differences++;
		}
	}
}
console.log(`\n${differences} differences`);
